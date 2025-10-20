import mongoose, { Document, Schema } from 'mongoose';

export interface IReaction {
  emoji: string;
  users: mongoose.Types.ObjectId[];
  count: number;
}

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId?: mongoose.Types.ObjectId;
  groupId?: mongoose.Types.ObjectId;
  content: string;
  isRead: boolean;
  messageType: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  replyTo?: mongoose.Types.ObjectId;
  deletedFor?: mongoose.Types.ObjectId[];
  deletedForEveryone?: boolean;
  isPinned?: boolean;
  reactions?: IReaction[];
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group'
  },
  content: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  fileUrl: {
    type: String
  },
  fileName: {
    type: String
  },
  fileType: {
    type: String
  },
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  deletedFor: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  deletedForEveryone: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  reactions: [{
    emoji: {
      type: String,
      required: true
    },
    users: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    count: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model<IMessage>('Message', MessageSchema);
