import { Request, Response, NextFunction } from 'express';
import PaymentsService from './payments.service';

class PaymentsController {
  private paymentsService: PaymentsService;

  constructor({ paymentsService }: { paymentsService: PaymentsService }) {
    this.paymentsService = paymentsService;
  }

  /**
   * POST /payments/create
   * Creates a new payment transaction and returns Xendit Invoice URL.
   */
  createPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const { departureId, destinationId, passengers, isRoundTrip, addOnProteksi, voucherCode } = req.body;

      const result = await this.paymentsService.createPayment({
        userId: user._id.toString(),
        departureId,
        destinationId,
        passengers,
        isRoundTrip: isRoundTrip || false,
        addOnProteksi: addOnProteksi || false,
        voucherCode: voucherCode || undefined,
      });

      res.status(201).json({
        success: true,
        message: 'Payment transaction created',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /payments/webhook
   * Handles Xendit notification callback — no auth required (called by Xendit servers).
   */
  handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const callbackToken = req.headers['x-callback-token'] as string | undefined;
      const result = await this.paymentsService.handleWebhook(req.body, callbackToken);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          orderId: result.orderId,
          status: result.status,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default PaymentsController;
