import { Request, Response, NextFunction } from 'express';
import TransactionsService from './transactions.service';

class TransactionsController {
  private transactionsService: TransactionsService;

  constructor({ transactionsService }: { transactionsService: TransactionsService }) {
    this.transactionsService = transactionsService;
  }

  /**
   * GET /transactions
   */
  getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const status = req.query.status as string | undefined;

      const result = await this.transactionsService.getTransactionHistory(
        user._id.toString(),
        page,
        limit,
        status,
      );

      res.status(200).json({
        success: true,
        message: 'Transaction history retrieved',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /transactions/pending
   */
  getPending = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      
      const result = await this.transactionsService.getPendingTransactions(
        user._id.toString()
      );

      res.status(200).json({
        success: true,
        message: 'Pending transactions retrieved',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /transactions/:orderId
   */
  getByOrderId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const { orderId } = req.params;

      const transaction = await this.transactionsService.getTransactionByOrderId(
        orderId as string,
        user._id.toString(),
      );

      res.status(200).json({
        success: true,
        message: 'Transaction retrieved',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default TransactionsController;
