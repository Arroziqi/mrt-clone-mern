import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { ITransaction } from '../../models/Transaction';
import { ITicket } from '../../models/Ticket';
import { AppError } from '../../utils/AppError';

class TransactionsService {
  private TransactionModel: Model<ITransaction>;
  private TicketModel: Model<ITicket>;

  constructor({
    TransactionModel,
    TicketModel,
  }: {
    TransactionModel: Model<ITransaction>;
    TicketModel: Model<ITicket>;
  }) {
    this.TransactionModel = TransactionModel;
    this.TicketModel = TicketModel;
  }

  /**
   * Get paginated transaction history for a specific user.
   */
  async getTransactionHistory(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
  ) {
    const filter: Record<string, any> = { user: new mongoose.Types.ObjectId(userId) };
    if (status) {
      filter.status = status.toUpperCase();
    }

    const skip = (page - 1) * limit;
    const totalItems = await this.TransactionModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    const transactions = await this.TransactionModel.find(filter)
      .populate({
        path: 'ticket',
        select: 'departureStation destinationStation passengers isRoundTrip addOnProteksi totalPrice status',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      transactions: transactions.map((tx) => this.formatTransaction(tx)),
      pagination: {
        totalItems,
        currentPage: page,
        totalPages,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get all pending transactions for a specific user (no pagination).
   */
  async getPendingTransactions(userId: string) {
    const transactions = await this.TransactionModel.find({
      user: new mongoose.Types.ObjectId(userId),
      status: 'PENDING',
    })
      .populate({
        path: 'ticket',
        select: 'departureStation destinationStation passengers isRoundTrip addOnProteksi totalPrice status',
      })
      .sort({ createdAt: -1 })
      .lean();

    return transactions.map((tx) => this.formatTransaction(tx));
  }

  /**
   * Get a single transaction by orderId for the authenticated user.
   */
  async getTransactionByOrderId(orderId: string, userId: string) {
    const transaction = await this.TransactionModel.findOne({
      orderId,
      user: new mongoose.Types.ObjectId(userId),
    })
      .populate({
        path: 'ticket',
        select: 'departureStation destinationStation passengers isRoundTrip addOnProteksi totalPrice status qrCodeData purchasedAt expiresAt',
      })
      .lean();

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    return this.formatTransaction(transaction);
  }

  /**
   * Sanitize transaction output — remove sensitive/internal fields.
   */
  private formatTransaction(tx: any) {
    return {
      orderId: tx.orderId,
      status: tx.status,
      grossAmount: tx.grossAmount,
      discountAmount: tx.discountAmount,
      finalAmount: tx.finalAmount,
      voucherCode: tx.voucherCode,
      paymentType: tx.paymentType,
      snapRedirectUrl: tx.snapRedirectUrl,
      paidAt: tx.paidAt,
      expiredAt: tx.expiredAt,
      ticket: tx.ticket,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    };
  }
}

export default TransactionsService;
