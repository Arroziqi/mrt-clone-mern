import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISchedule extends Document {
  stationId: string;
  direction: 'northbound' | 'southbound';
  dayType: 'weekday' | 'weekend';
  departures: string[];
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema<ISchedule>({
  stationId: {
    type: String,
    required: true,
    index: true
  },
  direction: {
    type: String,
    required: true,
    enum: ['northbound', 'southbound']
  },
  dayType: {
    type: String,
    required: true,
    enum: ['weekday', 'weekend']
  },
  departures: {
    type: [String],
    required: true,
    default: []
  }
}, { timestamps: true });

// Compound index: one schedule per station+direction+dayType
scheduleSchema.index({ stationId: 1, direction: 1, dayType: 1 }, { unique: true });

const Schedule: Model<ISchedule> = mongoose.model<ISchedule>('Schedule', scheduleSchema);
export default Schedule;
