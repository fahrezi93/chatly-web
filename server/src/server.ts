import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from './models/User';
import Message from './models/Message';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Map to store userId -> socketId
const userSockets = new Map<string, string>();

// ============ REST API Routes ============

// Register endpoint
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update online status
    user.isOnline = true;
    await user.save();

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (contacts)
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({ username: 1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages between two users
app.get('/api/messages/:userId/:recipientId', async (req: Request, res: Response) => {
  try {
    const { userId, recipientId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: recipientId },
        { senderId: recipientId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      fileUrl,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ Socket.IO Events ============

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // User joins with their userId
  socket.on('user-connected', async (userId: string) => {
    // Check if user already has a socket connection
    const existingSocketId = userSockets.get(userId);
    if (existingSocketId && existingSocketId !== socket.id) {
      console.log(`⚠️ User ${userId} already connected with socket ${existingSocketId}`);
      console.log(`🔄 Replacing old socket with new socket ${socket.id}`);
      
      // Disconnect the old socket
      const existingSocket = io.sockets.sockets.get(existingSocketId);
      if (existingSocket) {
        existingSocket.disconnect(true);
      }
    }
    
    userSockets.set(userId, socket.id);
    console.log(`👤 User ${userId} mapped to socket ${socket.id}`);

    // Update user online status
    await User.findByIdAndUpdate(userId, { isOnline: true });

    // Broadcast online status to all users
    io.emit('user-status-changed', { userId, isOnline: true });
  });

  // Private message
  socket.on('private-message', async (data: { 
    senderId: string; 
    receiverId: string; 
    content: string;
    messageType?: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
  }) => {
    try {
      const { senderId, receiverId, content, messageType, fileUrl, fileName, fileType } = data;

      // Save message to database
      const message = new Message({
        senderId,
        receiverId,
        content,
        isRead: false,
        messageType: messageType || 'text',
        fileUrl,
        fileName,
        fileType
      });
      await message.save();

      // Send to receiver if online
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive-message', {
          id: message._id,
          senderId,
          receiverId,
          content,
          createdAt: message.createdAt,
          isRead: false,
          status: 'delivered',
          messageType: message.messageType,
          fileUrl: message.fileUrl,
          fileName: message.fileName,
          fileType: message.fileType
        });
      }

      // Send confirmation back to sender
      socket.emit('message-sent', {
        id: message._id,
        senderId,
        receiverId,
        content,
        createdAt: message.createdAt,
        isRead: false,
        status: receiverSocketId ? 'delivered' : 'sent',
        messageType: message.messageType,
        fileUrl: message.fileUrl,
        fileName: message.fileName,
        fileType: message.fileType
      });
    } catch (error) {
      console.error('Private message error:', error);
    }
  });

  // Mark messages as read
  socket.on('mark-as-read', async (data: { messageIds: string[]; receiverId: string; senderId: string }) => {
    try {
      const { messageIds, receiverId, senderId } = data;
      
      // Update messages in database
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { isRead: true }
      );

      // Notify sender that messages were read
      const senderSocketId = userSockets.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messages-read', {
          messageIds,
          readBy: receiverId
        });
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  });

  // Typing indicator
  socket.on('typing', (data: { senderId: string; receiverId: string; isTyping: boolean }) => {
    const { receiverId, senderId, isTyping } = data;
    const receiverSocketId = userSockets.get(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user-typing', { userId: senderId, isTyping });
    }
  });

  // WebRTC Signaling - Call user
  socket.on('call-user', (data: { callerId: string; receiverId: string; offer: any }) => {
    const { receiverId, offer, callerId } = data;
    console.log(`📞 Call from ${callerId} to ${receiverId}`);
    
    const receiverSocketId = userSockets.get(receiverId);
    console.log(`Receiver socket ID: ${receiverSocketId}`);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('incoming-call', { callerId, offer });
      console.log(`✅ Incoming call event sent to ${receiverId}`);
    } else {
      console.log(`❌ Receiver ${receiverId} not found in userSockets`);
    }
  });

  // WebRTC Signaling - Answer call
  socket.on('answer-call', (data: { callerId: string; answer: any }) => {
    const { callerId, answer } = data;
    console.log(`📱 Answer from receiver to caller ${callerId}`);
    
    const callerSocketId = userSockets.get(callerId);
    
    if (callerSocketId) {
      io.to(callerSocketId).emit('call-answered', { answer });
      console.log(`✅ Call answered event sent to ${callerId}`);
    } else {
      console.log(`❌ Caller ${callerId} not found in userSockets`);
    }
  });

  // WebRTC Signaling - ICE candidate
  socket.on('ice-candidate', (data: { targetUserId: string; candidate: any }) => {
    const { targetUserId, candidate } = data;
    const targetSocketId = userSockets.get(targetUserId);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('ice-candidate', { candidate });
    }
  });

  // Reject call
  socket.on('reject-call', (data: { callerId: string }) => {
    const { callerId } = data;
    const callerSocketId = userSockets.get(callerId);
    
    if (callerSocketId) {
      io.to(callerSocketId).emit('call-rejected');
    }
  });

  // End call
  socket.on('end-call', (data: { targetUserId: string }) => {
    const { targetUserId } = data;
    const targetSocketId = userSockets.get(targetUserId);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('call-ended');
    }
  });

  // Disconnect
  socket.on('disconnect', async () => {
    console.log('🔌 User disconnected:', socket.id);

    // Find and remove user from map
    let disconnectedUserId: string | null = null;
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        userSockets.delete(userId);
        break;
      }
    }

    // Update user offline status
    if (disconnectedUserId) {
      await User.findByIdAndUpdate(disconnectedUserId, { 
        isOnline: false,
        lastSeen: new Date()
      });

      // Broadcast offline status
      io.emit('user-status-changed', { userId: disconnectedUserId, isOnline: false });
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
