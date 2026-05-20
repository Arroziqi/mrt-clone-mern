import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITicket extends Document {
  // userId: mongoose.Types.ObjectId;
  departureStation: string;
  destinationStation: string;
  passengers: number;
  isRoundTrip: boolean;
  addOnProteksi: boolean;
  totalPrice: number;
  status: 'PENDING' | 'ACTIVE' | 'USED' | 'EXPIRED';
  qrCodeData?: string;
  purchasedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>({
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  departureStation: { type: String, required: true },
  destinationStation: { type: String, required: true },
  passengers: { type: Number, required: true, default: 1 },
  isRoundTrip: { type: Boolean, default: false },
  addOnProteksi: { type: Boolean, default: false },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'ACTIVE', 'USED', 'EXPIRED'], default: 'PENDING' },
  qrCodeData: { type: String },
  purchasedAt: { type: Date },
  expiresAt: { type: Date }
}, { timestamps: true });

const Ticket: Model<ITicket> = mongoose.model<ITicket>('Ticket', ticketSchema);
export default Ticket;
