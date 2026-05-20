import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  fullName: string;
  email: string;
  phoneNumber: string;
  pin: string;
  age?: number;
  balance: number;
  correctPin(candidatePin: string, userPin?: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  pin: {
    type: String,
    required: true,
    select: false
  },
  age: {
    type: Number
  },
  balance: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Hash pin before saving
userSchema.pre('save', async function() {
  if (!this.isModified('pin') || !this.pin) return;
  this.pin = await bcrypt.hash(this.pin, 12);
});

// Method to check pin
userSchema.methods.correctPin = async function(candidatePin: string, userPin?: string): Promise<boolean> {
  if (!userPin) return false;
  return await bcrypt.compare(candidatePin, userPin);
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
