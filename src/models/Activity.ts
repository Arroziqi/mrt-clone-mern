import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'TICKET_PURCHASE' | 'TOP_UP' | 'SUBSCRIPTION';
  amount: number;
  status: 'SUCCESS' | 'FAILED';
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['TICKET_PURCHASE', 'TOP_UP', 'SUBSCRIPTION'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED'],
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Activity: Model<IActivity> = mongoose.model<IActivity>('Activity', activitySchema);
export default Activity;
