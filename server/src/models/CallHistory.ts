import mongoose, { Document, Schema } from 'mongoose';

export interface ICallHistory extends Document {
  callerId: string;
  receiverId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  status: 'completed' | 'missed' | 'rejected' | 'no-answer';
  callType: 'voice' | 'video';
  createdAt: Date;
  updatedAt: Date;
}

const CallHistorySchema = new Schema<ICallHistory>(
  {
    callerId: {
      type: String,
      required: true,
      ref: 'User'
    },
    receiverId: {
      type: String,
      required: true,
      ref: 'User'
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now
    },
    endTime: {
      type: Date
    },
    duration: {
      type: Number, // in seconds
      default: 0
    },
    status: {
      type: String,
      enum: ['completed', 'missed', 'rejected', 'no-answer'],
      default: 'no-answer'
    },
    callType: {
      type: String,
      enum: ['voice', 'video'],
      default: 'voice'
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
CallHistorySchema.index({ callerId: 1, createdAt: -1 });
CallHistorySchema.index({ receiverId: 1, createdAt: -1 });

export default mongoose.model<ICallHistory>('CallHistory', CallHistorySchema);
