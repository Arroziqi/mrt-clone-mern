import { Request, Response, NextFunction } from 'express';
import VouchersService from './vouchers.service';
import TicketsService from '../tickets/tickets.service';

class VouchersController {
  private vouchersService: VouchersService;
  private ticketsService: TicketsService;

  constructor({
    vouchersService,
    ticketsService,
  }: {
    vouchersService: VouchersService;
    ticketsService: TicketsService;
  }) {
    this.vouchersService = vouchersService;
    this.ticketsService = ticketsService;
  }

  /**
   * POST /vouchers/apply
   * Validates voucher and returns discount preview (does not commit).
   */
  applyVoucher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, departureId, destinationId, passengers, isRoundTrip, addOnProteksi } = req.body;

      // Calculate gross fare using existing ticket pricing logic
      const grossAmount = await this.ticketsService.calculatePrice(
        departureId,
        destinationId,
        passengers,
        isRoundTrip,
        addOnProteksi,
      );

      const result = await this.vouchersService.validateVoucher(code, grossAmount);

      res.status(200).json({
        success: true,
        message: 'Voucher applied successfully',
        data: {
          grossAmount,
          ...result,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default VouchersController;
