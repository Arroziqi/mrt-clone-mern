import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPaymentMethod extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  provider: string;
  accountNumber: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const paymentMethodSchema = new Schema<IPaymentMethod>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true // e.g., 'E_WALLET', 'CREDIT_CARD'
  },
  provider: {
    type: String,
    required: true // e.g., 'Gopay', 'OVO', 'Visa'
  },
  accountNumber: {
    type: String,
    required: true // masked number
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const PaymentMethod: Model<IPaymentMethod> = mongoose.model<IPaymentMethod>('PaymentMethod', paymentMethodSchema);
export default PaymentMethod;
