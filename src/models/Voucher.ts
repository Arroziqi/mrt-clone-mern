import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IVoucher extends Document {
  code: string;
  description: string;
  discountAmount: number | null;
  discountPercentage: number | null;
  maxDiscountAmount: number | null;
  minTransactionAmount: number;
  usageLimit: number;
  usageCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const voucherSchema = new Schema<IVoucher>({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  discountAmount: { type: Number, default: null },
  discountPercentage: { type: Number, default: null, min: 0, max: 100 },
  maxDiscountAmount: { type: Number, default: null },
  minTransactionAmount: { type: Number, default: 0 },
  usageLimit: { type: Number, default: 0 },
  usageCount: { type: Number, default: 0 },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });



const Voucher: Model<IVoucher> = mongoose.model<IVoucher>('Voucher', voucherSchema);
export default Voucher;
