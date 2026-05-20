import { Model } from 'mongoose';
import crypto from 'crypto';
import { ITransaction, TransactionStatus } from '../../models/Transaction';
import { ITicket } from '../../models/Ticket';
import { IStation } from '../../models/Station';
import TicketsService from '../tickets/tickets.service';
import VouchersService from '../vouchers/vouchers.service';
import { AppError } from '../../utils/AppError';
import logger from '../../utils/logger';

import { Xendit } from 'xendit-node';
class PaymentsService {
  private TransactionModel: Model<ITransaction>;
  private TicketModel: Model<ITicket>;
  private StationModel: Model<IStation>;
  private ticketsService: TicketsService;
  private vouchersService: VouchersService;
  private xendit: Xendit;

  constructor({
    TransactionModel,
    TicketModel,
    StationModel,
    ticketsService,
    vouchersService,
  }: {
    TransactionModel: Model<ITransaction>;
    TicketModel: Model<ITicket>;
    StationModel: Model<IStation>;
    ticketsService: TicketsService;
    vouchersService: VouchersService;
  }) {
    this.TransactionModel = TransactionModel;
    this.TicketModel = TicketModel;
    this.StationModel = StationModel;
    this.ticketsService = ticketsService;
    this.vouchersService = vouchersService;

    // Initialize Xendit client
    this.xendit = new Xendit({
      secretKey: process.env.XENDIT_SECRET_KEY || 'xnd_development_dummy', // fallback just for instantiation safely
    });
  }

  /**
   * Generate a unique order ID for Midtrans.
   */
  private generateOrderId(): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `MRT-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Create a payment transaction:
   * 1. Calculate fare using existing ticket pricing
   * 2. Optionally apply voucher
   * 3. Create Ticket (PENDING)
   * 4. Create Transaction (PENDING)
   * 5. Request Xendit Invoice URL
   * 6. Return token + redirect URL
   */
  async createPayment(data: {
    userId: string;
    departureId: string;
    destinationId: string;
    passengers: number;
    isRoundTrip: boolean;
    addOnProteksi: boolean;
    voucherCode?: string;
  }) {
    const { userId, departureId, destinationId, passengers, isRoundTrip, addOnProteksi, voucherCode } = data;

    // 1. Calculate gross fare using existing logic
    const grossAmount = await this.ticketsService.calculatePrice(
      departureId,
      destinationId,
      passengers,
      isRoundTrip,
      addOnProteksi,
    );

    // 2. Apply voucher if provided
    let discountAmount = 0;
    let finalAmount = grossAmount;

    if (voucherCode) {
      const voucherResult = await this.vouchersService.validateVoucher(voucherCode, grossAmount);
      discountAmount = voucherResult.discountAmount;
      finalAmount = voucherResult.finalAmount;

      // Consume voucher (increment usage)
      await this.vouchersService.consumeVoucher(voucherCode);
    }

    // Ensure final amount is at least 1 (Midtrans minimum)
    finalAmount = Math.max(finalAmount, 1);

    // 3. Create Ticket (PENDING — only becomes ACTIVE after payment)
    const ticket = await this.TicketModel.create({
      userId,
      departureStation: departureId,
      destinationStation: destinationId,
      passengers,
      isRoundTrip,
      addOnProteksi,
      totalPrice: finalAmount,
      status: 'PENDING',
    });

    // 4. Create Transaction (PENDING)
    const orderId = this.generateOrderId();
    const transaction = await this.TransactionModel.create({
      orderId,
      user: userId,
      ticket: ticket._id,
      grossAmount,
      discountAmount,
      finalAmount,
      voucherCode: voucherCode?.toUpperCase() || null,
      status: 'PENDING',
    });

    // Link ticket to transaction
    ticket.transaction = transaction._id as any;
    await ticket.save();

    // 5. Request Xendit Invoice
    try {
      const invoiceResponse = await this.xendit.Invoice.createInvoice({
        data: {
          externalId: orderId,
          amount: finalAmount,
          description: `MRT ${departureId} → ${destinationId} (${passengers} pax)`,
          customer: {
            email: 'user@mrt.co.id'
          }
        }
      });

      // 6. Store Xendit details and return
      transaction.xenditInvoiceId = invoiceResponse.id || null;
      transaction.xenditInvoiceUrl = invoiceResponse.invoiceUrl || null;
      await transaction.save();

      logger.info(`Payment created: ${orderId} | Final: Rp ${finalAmount} | Discount: Rp ${discountAmount}`);

      return {
        orderId,
        grossAmount,
        discountAmount,
        finalAmount,
        voucherCode: voucherCode?.toUpperCase() || null,
        invoiceUrl: invoiceResponse.invoiceUrl || null,
      };
    } catch (error: any) {
      // Rollback: mark transaction as FAILED
      transaction.status = 'FAILED';
      await transaction.save();

      logger.error(`Xendit Invoice error for ${orderId}: ${error.message}`);
      throw new AppError('Failed to create payment with Xendit. Please try again.', 502);
    }
  }

  /**
   * Handle Xendit webhook/notification callback.
   * Validates token, prevents duplicate updates, and updates transaction + ticket status.
   */
  async handleWebhook(notificationPayload: Record<string, any>, callbackToken: string | undefined) {
    const {
      external_id: orderId,
      status: invoiceStatus,
      id: xenditInvoiceId,
      payment_method: paymentMethod,
    } = notificationPayload;

    // 1. Verify token
    const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN || '';
    if (!callbackToken || callbackToken !== expectedToken) {
      logger.warn(`Webhook token mismatch for order ${orderId}`);
      throw new AppError('Invalid webhook token', 403);
    }

    // 2. Find transaction
    const transaction = await this.TransactionModel.findOne({ orderId });
    if (!transaction) {
      logger.warn(`Webhook received for unknown order: ${orderId}`);
      throw new AppError('Transaction not found', 404);
    }

    // 3. Determine new status
    const newStatus = this.mapXenditStatus(invoiceStatus);

    // 4. Idempotency: skip if already in a terminal state
    if (transaction.status === 'PAID' || transaction.status === 'FAILED') {
      logger.info(`Webhook skipped for ${orderId}: already in terminal state ${transaction.status}`);
      return { orderId, status: transaction.status, message: 'Already processed' };
    }

    // 5. Update transaction
    transaction.status = newStatus;
    transaction.xenditPaymentMethod = paymentMethod || null;
    transaction.webhookPayload = notificationPayload;

    if (newStatus === 'PAID') {
      transaction.paidAt = new Date();
    } else if (newStatus === 'EXPIRED') {
      transaction.expiredAt = new Date();
    }

    await transaction.save();

    // 6. Update corresponding ticket
    const ticket = await this.TicketModel.findById(transaction.ticket);
    if (ticket) {
      if (newStatus === 'PAID') {
        ticket.status = 'ACTIVE';
        ticket.purchasedAt = new Date();
        ticket.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h validity
        ticket.qrCodeData = `MRT-QR-${ticket._id}-${Date.now()}`;
      } else if (newStatus === 'FAILED' || newStatus === 'EXPIRED') {
        ticket.status = 'EXPIRED';
      }
      await ticket.save();
    }

    logger.info(`Webhook processed: ${orderId} → ${newStatus}`);

    return { orderId, status: newStatus, message: 'Webhook processed' };
  }

  /**
   * Map Xendit invoice status to our internal TransactionStatus.
   */
  private mapXenditStatus(invoiceStatus: string): TransactionStatus {
    switch (invoiceStatus?.toUpperCase()) {
      case 'PAID':
      case 'SETTLED':
        return 'PAID';
      case 'PENDING':
        return 'PENDING';
      case 'EXPIRED':
        return 'EXPIRED';
      default:
        return 'FAILED';
    }
  }
}

export default PaymentsService;
