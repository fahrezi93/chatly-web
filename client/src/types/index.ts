export interface User {
  _id: string;
  username: string;
  email: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface Message {
  _id?: string;
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  isRead?: boolean;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}
