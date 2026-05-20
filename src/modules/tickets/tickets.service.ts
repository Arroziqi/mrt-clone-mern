import { Model } from 'mongoose';
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
}

export default TicketsService;
