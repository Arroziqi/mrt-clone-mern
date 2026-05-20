import { Request, Response, NextFunction } from 'express';
import TicketsService from './tickets.service';

class TicketsController {
  private ticketsService: TicketsService;

  constructor({ ticketsService }: { ticketsService: TicketsService }) {
    this.ticketsService = ticketsService;
  }

  checkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticket = await this.ticketsService.createCheckout(req.body);
      res.status(201).json({
        success: true,
        message: 'Checkout created successfully',
        data: ticket
      });
    } catch (error: any) {
      if (error.message === 'Invalid station IDs') {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  };

  pay = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ticketId, pin } = req.body;
      const activeTicket = await this.ticketsService.processPayment(ticketId, pin);
      res.status(200).json({
        success: true,
        message: 'Payment successful, ticket is now active',
        data: activeTicket
      });
    } catch (error: any) {
      if (error.message === 'Invalid PIN' || error.message.includes('not found') || error.message.includes('pending')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  };
}

export default TicketsController;
