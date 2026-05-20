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
  getActive = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const tickets = await this.ticketsService.getActiveTickets(user._id.toString());
      
      res.status(200).json({
        success: true,
        message: 'Active tickets retrieved',
        data: tickets
      });
    } catch (error) {
      next(error);
    }
  };

  getUsedHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      
      const result = await this.ticketsService.getUsedTicketHistory(user._id.toString(), page, limit);
      
      res.status(200).json({
        success: true,
        message: 'Used ticket history retrieved',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      
      const ticket = await this.ticketsService.getTicketDetail(id as string, user._id.toString());
      
      res.status(200).json({
        success: true,
        message: 'Ticket details retrieved',
        data: ticket
      });
    } catch (error: any) {
      if (error.message === 'Ticket not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  };
}

export default TicketsController;
