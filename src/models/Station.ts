import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IStation extends Document {
  stationId: string;
  name: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const stationSchema = new Schema<IStation>({
  stationId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  orderIndex: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Station: Model<IStation> = mongoose.model<IStation>('Station', stationSchema);
export default Station;
