export interface User {
  _id: string;
  username: string;
  displayName: string;
  email: string;
  isOnline: boolean;
  lastSeen: Date;
  profilePicture?: string;
  bio?: string;
  status?: string;
  isVerified?: boolean;
}

export interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface Message {
  _id?: string;
  id?: string;
  senderId: string | User; // Can be populated
  receiverId?: string;
  groupId?: string;
  content: string;
  createdAt: Date;
  timestamp?: Date;
  isRead?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  messageType?: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  replyTo?: Message | string;
  deletedFor?: string[];
  deletedForEveryone?: boolean;
  isPinned?: boolean;
  reactions?: Reaction[];
  sender?: User; // Deprecated, use senderId when populated
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  groupPicture?: string;
  creator: User | string;
  admins: (User | string)[];
  members: (User | string)[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    email: string;
  };
}
