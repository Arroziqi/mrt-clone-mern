import mongoose, { Model } from 'mongoose';
import { ITicket } from '../../models/Ticket';
import { IStation } from '../../models/Station';

class TicketsService {
  private TicketModel: Model<ITicket>;
  private StationModel: Model<IStation>;

  constructor({ TicketModel, StationModel }: { TicketModel: Model<ITicket>, StationModel: Model<IStation> }) {
    this.TicketModel = TicketModel;
    this.StationModel = StationModel;
  }

  async calculatePrice(departureId: string, destinationId: string, passengers: number, isRoundTrip: boolean, addOnProteksi: boolean) {
    const dep = await this.StationModel.findOne({ stationId: departureId });
    const dest = await this.StationModel.findOne({ stationId: destinationId });
    
    if (!dep || !dest) throw new Error('Invalid station IDs');

    // Compute ticket price between two stations (Rp 1.000 per station hop, min Rp 3.000).
    const hops = Math.abs(dep.orderIndex - dest.orderIndex);
    let unitPrice = hops <= 1 ? 3000 : hops * 1000;
    
    if (isRoundTrip) unitPrice *= 2;
    
    let total = unitPrice * passengers;
    if (addOnProteksi) total += (1000 * passengers); // 1000 IDR per passenger for protection

    return total;
  }

  async createCheckout(data: any) {
    const { departureId, destinationId, passengers, isRoundTrip, addOnProteksi } = data;
    
    const totalPrice = await this.calculatePrice(departureId, destinationId, passengers, isRoundTrip, addOnProteksi);

    const ticket = await this.TicketModel.create({
      departureStation: departureId,
      destinationStation: destinationId,
      passengers,
      isRoundTrip,
      addOnProteksi,
      totalPrice,
      status: 'PENDING'
    });

    return ticket;
  }

  async processPayment(ticketId: string, pin: string) {
    const ticket = await this.TicketModel.findById(ticketId);
    if (!ticket) throw new Error('Ticket not found');
    if (ticket.status !== 'PENDING') throw new Error('Ticket is not in pending state');

    // Mock payment validation with pin
    if (pin !== '123456') { // In real app, check user's hashed PIN
       throw new Error('Invalid PIN');
    }

    ticket.status = 'ACTIVE';
    ticket.purchasedAt = new Date();
    // Expires in 24 hours
    ticket.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    ticket.qrCodeData = `MRT-QR-${ticket._id}-${Date.now()}`;
    
    await ticket.save();
    return ticket;
  }

  async getActiveTickets(userId: string) {
    const filter: Record<string, any> = {
      userId: new mongoose.Types.ObjectId(userId),
      status: 'ACTIVE',
    };
    const tickets = await this.TicketModel.find(filter)
      .sort({ purchasedAt: -1 })
      .lean();

    return tickets.map((t) => this.formatTicket(t));
  }

  async getUsedTicketHistory(userId: string, page: number = 1, limit: number = 10) {
    const filter: Record<string, any> = {
      userId: new mongoose.Types.ObjectId(userId),
      status: 'USED',
    };

    const skip = (page - 1) * limit;
    const totalItems = await this.TicketModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    const tickets = await this.TicketModel.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      tickets: tickets.map((t) => this.formatTicket(t)),
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

  async getTicketDetail(ticketId: string, userId: string) {
    const ticket = await this.TicketModel.findOne({
      _id: new mongoose.Types.ObjectId(ticketId),
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    return this.formatTicket(ticket);
  }

  private formatTicket(ticket: any) {
    return {
      id: ticket._id,
      transaction: ticket.transaction,
      departureStation: ticket.departureStation,
      destinationStation: ticket.destinationStation,
      passengers: ticket.passengers,
      isRoundTrip: ticket.isRoundTrip,
      addOnProteksi: ticket.addOnProteksi,
      totalPrice: ticket.totalPrice,
      status: ticket.status,
      qrCodeData: ticket.qrCodeData,
      purchasedAt: ticket.purchasedAt,
      expiresAt: ticket.expiresAt,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
  }
}

export default TicketsService;
