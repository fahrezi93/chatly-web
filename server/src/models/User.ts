import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  displayName: string;
  email: string;
  password: string;
  isOnline: boolean;
  lastSeen: Date;
  profilePicture?: string;
  bio?: string;
  status?: string;
  isVerified?: boolean;
  isAdmin?: boolean;
  isBanned?: boolean;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 20,
    match: /^[a-z0-9_ ]+$/, // Allow letters, numbers, underscore, and spaces
    immutable: true // Username cannot be changed after creation
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: '',
    maxlength: 150
  },
  status: {
    type: String,
    default: 'Halo! Saya menggunakan aplikasi Chatly ini.',
    maxlength: 100
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isBanned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
