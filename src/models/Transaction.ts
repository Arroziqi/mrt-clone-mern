import mongoose, { Document, Model, Schema } from 'mongoose';

export type TransactionStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';

export interface ITransaction extends Document {
  orderId: string;
  user: mongoose.Types.ObjectId;
  ticket: mongoose.Types.ObjectId;
  grossAmount: number;
  discountAmount: number;
  finalAmount: number;
  voucherCode: string | null;
  status: TransactionStatus;
  xenditInvoiceId: string | null;
  xenditInvoiceUrl: string | null;
  xenditPaymentMethod: string | null;
  paidAt: Date | null;
  expiredAt: Date | null;
  webhookPayload: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  orderId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  grossAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  voucherCode: { type: String, default: null },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'EXPIRED'],
    default: 'PENDING',
  },
  xenditInvoiceId: { type: String, default: null },
  xenditInvoiceUrl: { type: String, default: null },
  xenditPaymentMethod: { type: String, default: null },
  paidAt: { type: Date, default: null },
  expiredAt: { type: Date, default: null },
  webhookPayload: { type: Schema.Types.Mixed, default: null },
}, { timestamps: true });

transactionSchema.index({ user: 1 });
transactionSchema.index({ status: 1 });

const Transaction: Model<ITransaction> = mongoose.model<ITransaction>('Transaction', transactionSchema);
export default Transaction;
