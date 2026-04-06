import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import User from './models/User';
import Message from './models/Message';
import CallHistory from './models/CallHistory';
import Group from './models/Group';

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Get the directory path for uploads (works with both TS and compiled JS)
const uploadsDir = path.join(process.cwd(), 'server', 'uploads');

// ============ Allowed Origins ============
const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
];

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// ============ Security & Performance Middleware ============

// Security headers (helmet)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow Cloudinary images
  contentSecurityPolicy: false, // Handled by client-side framework
}));

// Gzip compression
app.use(compression());

// CORS — Whitelist hanya origin yang diizinkan
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin ${origin} is not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Body size limit — prevent JSON bomb attacks
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // Determine resource type based on file type
    const isImage = file.mimetype.startsWith('image/');
    
    return {
      folder: 'chat-app-uploads',
      resource_type: isImage ? 'image' : 'raw', // Use 'raw' for non-image files (PDF, DOC, etc)
      allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt'],
      public_id: `chat-app-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log('📁 Uploads directory:', uploadsDir);
    console.log('📁 Directory exists:', fs.existsSync(uploadsDir));
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// JWT Secret — warn if using default (insecure in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET not set in .env — using default insecure secret! Set JWT_SECRET in production.');
}

// ============ Rate Limiters ============

// Auth endpoints: 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Terlalu banyak percobaan login/register. Coba lagi dalam 15 menit.' },
  skipSuccessfulRequests: true, // Hanya hitung request yang gagal
});

// General API: 200 requests per minute per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Terlalu banyak request. Coba lebih lambat.' },
});

// ============ Auth Middleware ============

// Extend Express Request to include userId from JWT
interface AuthRequest extends Request {
  userId?: string;
}

// JWT Authentication Middleware
const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token tidak valid atau sudah kadaluarsa.' });
  }
};

// Admin Middleware (must be used AFTER authMiddleware)
const adminMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isAdmin) {
      res.status(403).json({ message: 'Akses ditolak. Hanya admin yang diizinkan.' });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Map to store userId → socketId
const userSockets = new Map<string, string>();

// Map to store active calls: callId → callHistoryId
const activeCalls = new Map<string, string>();

// ============ Socket.IO — JWT Authentication Middleware ============

// Attach verified userId from JWT to each socket connection
// This prevents clients from spoofing senderId in events
io.use((socket, next) => {
  const token = socket.handshake.auth?.token as string | undefined;
  if (!token) {
    return next(new Error('Authentication error: no token provided'));
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    socket.data.userId = decoded.userId;
    next();
  } catch {
    next(new Error('Authentication error: invalid token'));
  }
});

// Apply general rate limiter to all API routes
app.use('/api/', generalLimiter);

// Health check endpoint for Railway
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Chat API Server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok',
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Register endpoint — rate limited
app.post('/api/auth/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const { username, displayName, email, password } = req.body;

    // Validate password length
    if (!password || password.length < 8) {
      return res.status(400).json({
        message: 'Password minimal 8 karakter'
      });
    }

    // Validate username format
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({ 
        message: 'Username must be 3-20 characters long and contain only lowercase letters, numbers, and underscores' 
      });
    }

    // Validate displayName
    if (!displayName || displayName.trim().length < 1 || displayName.trim().length > 50) {
      return res.status(400).json({ 
        message: 'Display name must be between 1 and 50 characters' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username: username.toLowerCase(),
      displayName: displayName.trim(),
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
        displayName: user.displayName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login endpoint — rate limited
app.post('/api/auth/login', authLimiter, async (req: Request, res: Response) => {
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

    // Migration: Set displayName to username if not exists (for old users)
    // Update online status without running validators to avoid issues with legacy usernames
    const updateData: any = { isOnline: true };
    if (!user.displayName) {
      updateData.displayName = user.username;
    }
    
    await User.findByIdAndUpdate(user._id, updateData, { 
      runValidators: false, // Skip validation to handle legacy usernames with spaces
      new: true 
    });

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get users (contacts) — paginated, max 100 per call
app.get('/api/users', authMiddleware, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 100);
    const skip = parseInt(req.query.skip as string) || 0;

    const users = await User.find({}, { password: 0 })
      .sort({ username: 1 })
      .skip(skip)
      .limit(limit);
    
    // Migration: Set displayName to username if not exists (for old users)
    const updatedUsers = users.map(user => {
      if (!user.displayName) user.displayName = user.username;
      return user;
    });
    
    res.json(updatedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users by username or displayName — server-side, max 10 results
// Replaces client-side filtering over GET /api/users
app.get('/api/users/search', authMiddleware, async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim().replace('@', '');
    if (q.length < 2) {
      return res.status(400).json({ message: 'Query minimal 2 karakter' });
    }

    const regex = new RegExp(q, 'i');
    const users = await User.find(
      { $or: [{ username: regex }, { displayName: regex }] },
      { password: 0 }
    ).limit(10);

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search user by exact username (legacy endpoint)
app.get('/api/users/search/:username', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const searchUsername = username.toLowerCase().replace('@', '');
    
    const user = await User.findOne({ username: searchUsername }, { password: 0 });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Migration: Set displayName to username if not exists (for old users)
    if (!user.displayName) {
      user.displayName = user.username;
    }
    
    res.json(user);
  } catch (error) {
    console.error('Search user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin endpoint to verify a user
// Admin endpoint to verify/unverify user
app.post('/api/admin/verify-user', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { username, isVerified } = req.body;
    
    console.log('Verify user request:', { username, isVerified });
    
    const user = await User.findOne({ username: username.toLowerCase() });
    
    if (!user) {
      console.log('User not found:', username);
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isVerified = isVerified !== undefined ? isVerified : true;
    await user.save();
    
    console.log('User verification status updated:', { username: user.username, isVerified: user.isVerified });
    res.json({ message: 'User verification status updated', user: { username: user.username, isVerified: user.isVerified } });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin endpoint to set admin status
app.post('/api/admin/set-admin', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { username, isAdmin } = req.body;
    
    const user = await User.findOne({ username: username.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isAdmin = isAdmin !== undefined ? isAdmin : true;
    await user.save();
    
    res.json({ message: 'User admin status updated', user: { username: user.username, isAdmin: user.isAdmin } });
  } catch (error) {
    console.error('Set admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin endpoint to ban/unban user
app.post('/api/admin/ban-user', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, isBanned } = req.body;
    
    console.log('Ban user request:', { userId, isBanned });
    
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isBanned = isBanned !== undefined ? isBanned : true;
    await user.save();
    
    console.log('User ban status updated:', { username: user.username, isBanned: user.isBanned });
    res.json({ message: 'User ban status updated', user: { _id: user._id, username: user.username, isBanned: user.isBanned } });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin endpoint to get all users with stats
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin endpoint to get dashboard statistics
app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMessages = await Message.countDocuments();
    const totalGroups = await Group.countDocuments();
    const onlineUsers = await User.countDocuments({ isOnline: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    
    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    
    // Get messages today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messagesToday = await Message.countDocuments({ createdAt: { $gte: today } });
    
    res.json({
      totalUsers,
      totalMessages,
      totalGroups,
      onlineUsers,
      verifiedUsers,
      bannedUsers,
      newUsers,
      messagesToday
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin endpoint to delete user
// Admin endpoint to delete user
app.delete('/api/admin/users/:userId', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    console.log('Delete user request:', userId);
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete all messages from this user
    await Message.deleteMany({ senderId: userId });
    
    console.log('User and messages deleted:', user.username);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ Batch Last Messages Endpoint (Fix N+1 Query) ============

// Get last message for ALL conversations of a user in a single query
app.get('/api/messages/last-messages/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Use MongoDB aggregation to get last message per conversation partner
    const lastMessages = await Message.aggregate([
      {
        // Match messages where user is sender or receiver (private messages only)
        $match: {
          $or: [
            { senderId: userObjectId },
            { receiverId: userObjectId }
          ],
          groupId: { $exists: false },
          deletedForEveryone: { $ne: true }
        }
      },
      {
        // Sort by newest first
        $sort: { createdAt: -1 }
      },
      {
        // Determine the "other user" in the conversation
        $addFields: {
          conversationPartner: {
            $cond: {
              if: { $eq: ['$senderId', userObjectId] },
              then: '$receiverId',
              else: '$senderId'
            }
          }
        }
      },
      {
        // Group by conversation partner and get the first (newest) message
        $group: {
          _id: '$conversationPartner',
          lastMessage: { $first: '$$ROOT' }
        }
      },
      {
        // Reshape the output
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$lastMessage',
              { conversationPartnerId: '$_id' }
            ]
          }
        }
      }
    ]);

    // Convert to a map: { partnerId: lastMessage }
    const result: { [key: string]: any } = {};
    for (const msg of lastMessages) {
      const partnerId = msg.conversationPartnerId.toString();
      result[partnerId] = {
        _id: msg._id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        content: msg.content,
        createdAt: msg.createdAt,
        isRead: msg.isRead,
        messageType: msg.messageType,
        fileUrl: msg.fileUrl,
        fileName: msg.fileName
      };
    }

    res.json(result);
  } catch (error) {
    console.error('Get last messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages between two users
app.get('/api/messages/:userId/:recipientId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, recipientId } = req.params;
    const verifiedUserId = (req as AuthRequest).userId;

    // IDOR protection: hanya boleh fetch pesan milik sendiri
    if (verifiedUserId !== userId) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    const page = parseInt(req.query.page as string) || 0;
    const limit = 50;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: recipientId },
        { senderId: recipientId, receiverId: userId }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit);

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get call history for a user
app.get('/api/call-history/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Get call history where user is either caller or receiver
    const callHistory = await CallHistory.find({
      $or: [{ callerId: userId }, { receiverId: userId }]
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Populate user details
    const userIds = new Set<string>();
    callHistory.forEach(call => {
      userIds.add(call.callerId);
      userIds.add(call.receiverId);
    });

    const users = await User.find({ _id: { $in: Array.from(userIds) } }, { password: 0 });
    const userMap = new Map(users.map(u => [(u._id as any).toString(), u]));

    // Add user details to call history
    const enrichedHistory = callHistory.map(call => ({
      ...call,
      caller: userMap.get(call.callerId),
      receiver: userMap.get(call.receiverId),
      isIncoming: call.receiverId === userId
    }));

    res.json(enrichedHistory);
  } catch (error) {
    console.error('Get call history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// File upload endpoint
app.post('/api/upload', authMiddleware, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Use Cloudinary URL from multer-storage-cloudinary
    const fileUrl = (req.file as any).path; // Cloudinary URL
    
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

// ============ Profile & User Management Routes ============

// Get user profile
app.get('/api/users/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId, { password: 0 });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Migration: Set displayName to username if not exists (for old users)
    if (!user.displayName) {
      user.displayName = user.username;
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
app.put('/api/users/:userId', authMiddleware, upload.single('profilePicture'), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const verifiedUserId = (req as AuthRequest).userId;

    // IDOR protection: hanya boleh edit profil sendiri
    if (verifiedUserId !== userId) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    const { displayName, email, bio, status } = req.body;

    const updateData: any = {};
    // Username cannot be changed (immutable)
    if (displayName !== undefined) {
      if (displayName.trim().length < 1 || displayName.trim().length > 50) {
        return res.status(400).json({ 
          message: 'Display name must be between 1 and 50 characters' 
        });
      }
      updateData.displayName = displayName.trim();
    }
    
    // Validate and update email
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          message: 'Format email tidak valid' 
        });
      }
      
      // Check if email already exists (excluding current user)
      const existingUser = await User.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Email sudah digunakan oleh pengguna lain' 
        });
      }
      
      updateData.email = email.toLowerCase().trim();
    }
    
    if (bio !== undefined) updateData.bio = bio;
    if (status !== undefined) updateData.status = status;

    // Handle profile picture upload - use Cloudinary URL
    if (req.file) {
      updateData.profilePicture = (req.file as any).path; // Cloudinary URL
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    console.error('Update profile error:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'email') {
        return res.status(400).json({ 
          message: 'Email sudah digunakan oleh pengguna lain' 
        });
      }
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete message
app.delete('/api/messages/:messageId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { deleteForEveryone } = req.body;
    const userId = (req as AuthRequest).userId!; // Gunakan userId dari JWT

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (deleteForEveryone && message.senderId.toString() === userId) {
      // Delete for everyone
      message.deletedForEveryone = true;
      await message.save();
    } else {
      // Delete for self only
      if (!message.deletedFor) {
        message.deletedFor = [];
      }
      if (!message.deletedFor.includes(userId as any)) {
        message.deletedFor.push(userId as any);
      }
      await message.save();
    }

    res.json({ success: true, message });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Pin/Unpin message
app.post('/api/messages/:messageId/pin', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const pinUserId = (req as AuthRequest).userId!;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Hanya peserta percakapan yang boleh pin
    const isParticipant =
      message.senderId.toString() === pinUserId ||
      (message.receiverId && message.receiverId.toString() === pinUserId);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    // Toggle pin status
    message.isPinned = !message.isPinned;
    await message.save();

    res.json({ success: true, message });
  } catch (error) {
    console.error('Pin message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add reaction to message
app.post('/api/messages/:messageId/reaction', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = (req as AuthRequest).userId!; // Gunakan userId dari JWT

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Initialize reactions array if it doesn't exist
    if (!message.reactions) {
      message.reactions = [];
    }

    // Find existing reaction with the same emoji
    const existingReactionIndex = message.reactions.findIndex(r => r.emoji === emoji);

    if (existingReactionIndex >= 0) {
      // Check if user already reacted with this emoji
      const existingReaction = message.reactions[existingReactionIndex];
      if (!existingReaction.users.includes(userId as any)) {
        existingReaction.users.push(userId as any);
        existingReaction.count = existingReaction.users.length;
      }
    } else {
      // Create new reaction
      message.reactions.push({
        emoji,
        users: [userId as any],
        count: 1
      });
    }

    await message.save();
    res.json({ success: true, message });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove reaction from message
app.delete('/api/messages/:messageId/reaction', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = (req as AuthRequest).userId!; // Gunakan userId dari JWT

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (!message.reactions) {
      return res.json({ success: true, message });
    }

    // Find reaction with the emoji
    const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
    
    if (reactionIndex >= 0) {
      const reaction = message.reactions[reactionIndex];
      
      // Remove user from reaction
      reaction.users = reaction.users.filter(id => id.toString() !== userId);
      reaction.count = reaction.users.length;
      
      // Remove reaction if no users left
      if (reaction.count === 0) {
        message.reactions.splice(reactionIndex, 1);
      }
    }

    await message.save();
    res.json({ success: true, message });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ Group Chat Routes ============

// Create group
app.post('/api/groups', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, description, creator, members } = req.body;
    
    const Group = mongoose.model('Group');
    const group = new Group({
      name,
      description,
      creator,
      admins: [creator],
      members: [...members, creator]
    });

    await group.save();
    const populatedGroup = await Group.findById(group._id)
      .populate('creator', '-password')
      .populate('admins', '-password')
      .populate('members', '-password');

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user groups
app.get('/api/groups/user/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const Group = mongoose.model('Group');
    
    const groups = await Group.find({ members: userId })
      .populate('creator', '-password')
      .populate('admins', '-password')
      .populate('members', '-password')
      .sort({ updatedAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get group by ID
app.get('/api/groups/:groupId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const Group = mongoose.model('Group');
    
    const group = await Group.findById(groupId)
      .populate('creator', '-password')
      .populate('admins', '-password')
      .populate('members', '-password');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get group messages
app.get('/api/groups/:groupId/messages', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    const page = parseInt(req.query.page as string) || 0;
    const limit = 50;

    const messages = await Message.find({ groupId })
      .populate('senderId', '-password')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit);

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get group messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add member to group
app.post('/api/groups/:groupId/members', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { userId, addedBy } = req.body;
    const Group = mongoose.model('Group');

    const group: any = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if addedBy is admin
    if (!group.admins.includes(addedBy)) {
      return res.status(403).json({ message: 'Only admins can add members' });
    }

    // Add member if not already in group
    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }

    const updatedGroup = await Group.findById(groupId)
      .populate('creator', '-password')
      .populate('admins', '-password')
      .populate('members', '-password');

    res.json(updatedGroup);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove member from group
app.delete('/api/groups/:groupId/members/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { groupId, userId } = req.params;
    const { removedBy } = req.body;
    const Group = mongoose.model('Group');

    const group: any = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if removedBy is admin or user is removing themselves
    if (!group.admins.includes(removedBy) && removedBy !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    group.members = group.members.filter((m: any) => m.toString() !== userId);
    group.admins = group.admins.filter((a: any) => a.toString() !== userId);
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate('creator', '-password')
      .populate('admins', '-password')
      .populate('members', '-password');

    res.json(updatedGroup);
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update group
app.put('/api/groups/:groupId', authMiddleware, upload.single('groupPicture'), async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { name, description, updatedBy } = req.body;
    const Group = mongoose.model('Group');

    const group: any = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if updatedBy is admin
    if (!group.admins.includes(updatedBy)) {
      return res.status(403).json({ message: 'Only admins can update group' });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (req.file) updateData.groupPicture = (req.file as any).path; // Cloudinary URL

    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      updateData,
      { new: true }
    )
      .populate('creator', '-password')
      .populate('admins', '-password')
      .populate('members', '-password');

    res.json(updatedGroup);
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ Socket.IO Events ============

io.on('connection', (socket) => {
  // User joins with their userId — now verified via JWT middleware
  socket.on('user-connected', async (userId: string) => {
    // Verify the userId matches the JWT-verified userId (prevent spoofing)
    const verifiedUserId = socket.data.userId as string;
    if (verifiedUserId !== userId) {
      console.warn(`⚠️ userId mismatch: claimed ${userId}, verified ${verifiedUserId}`);
      userId = verifiedUserId; // Always use verified userId
    }

    // Check if user already has a socket connection
    const existingSocketId = userSockets.get(userId);
    if (existingSocketId && existingSocketId !== socket.id) {
      // Disconnect the old socket silently
      const existingSocket = io.sockets.sockets.get(existingSocketId);
      if (existingSocket) existingSocket.disconnect(true);
    }
    
    userSockets.set(userId, socket.id);

    // Update user online status
    await User.findByIdAndUpdate(userId, { isOnline: true });

    // Broadcast online status to all users
    io.emit('user-status-changed', { userId, isOnline: true });
  });

  // Private message — senderId is derived from verified JWT, not client data
  socket.on('private-message', async (data: { 
    receiverId: string; 
    content: string;
    messageType?: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    replyTo?: string;
  }) => {
    try {
      // Use verified userId from JWT — prevents senderId spoofing
      const senderId = socket.data.userId as string;
      const { receiverId, content, messageType, fileUrl, fileName, fileType, replyTo } = data;

      // Save message to database
      const message = new Message({
        senderId,
        receiverId,
        content,
        isRead: false,
        messageType: messageType || 'text',
        fileUrl,
        fileName,
        fileType,
        replyTo: replyTo || null
      });
      await message.save();

      // Populate replyTo if exists
      let populatedMessage: any = message;
      if (replyTo) {
        populatedMessage = await Message.findById(message._id)
          .populate('replyTo')
          .populate('senderId', '-password');
      }

      // Send to receiver if online
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive-message', {
          _id: populatedMessage._id,
          id: populatedMessage._id,
          senderId,
          receiverId,
          content,
          createdAt: populatedMessage.createdAt,
          isRead: false,
          status: 'delivered',
          messageType: populatedMessage.messageType,
          fileUrl: populatedMessage.fileUrl,
          fileName: populatedMessage.fileName,
          fileType: populatedMessage.fileType,
          replyTo: populatedMessage.replyTo
        });
      }

      // Send confirmation back to sender
      socket.emit('message-sent', {
        _id: populatedMessage._id,
        id: populatedMessage._id,
        senderId,
        receiverId,
        content,
        createdAt: populatedMessage.createdAt,
        isRead: false,
        status: receiverSocketId ? 'delivered' : 'sent',
        messageType: populatedMessage.messageType,
        fileUrl: populatedMessage.fileUrl,
        fileName: populatedMessage.fileName,
        fileType: populatedMessage.fileType,
        replyTo: populatedMessage.replyTo
      });
    } catch (error) {
      console.error('Private message error:', error);
    }
  });

  // Group message — senderId derived from verified JWT
  socket.on('group-message', async (data: {
    groupId: string;
    content: string;
    messageType?: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    replyTo?: string;
  }) => {
    try {
      // Use verified userId from JWT — prevents senderId spoofing
      const senderId = socket.data.userId as string;
      const { groupId, content, messageType, fileUrl, fileName, fileType, replyTo } = data;

      // Save message to database
      const message = new Message({
        senderId,
        groupId,
        content,
        isRead: false,
        messageType: messageType || 'text',
        fileUrl,
        fileName,
        fileType,
        replyTo: replyTo || null
      });
      await message.save();

      // Populate sender and replyTo
      const populatedMessage = await Message.findById(message._id)
        .populate('senderId', '-password')
        .populate('replyTo');

      if (!populatedMessage) {
        console.error('Failed to populate message');
        return;
      }

      // Get group members
      const group: any = await Group.findById(groupId);
      if (group) {
        // Send to all group members
        group.members.forEach((memberId: any) => {
          const memberSocketId = userSockets.get(memberId.toString());
          if (memberSocketId) {
            io.to(memberSocketId).emit('group-message-received', {
              _id: populatedMessage._id,
              id: populatedMessage._id,
              senderId: populatedMessage.senderId, // Already populated with user object
              groupId,
              content,
              createdAt: populatedMessage.createdAt,
              messageType: populatedMessage.messageType,
              fileUrl: populatedMessage.fileUrl,
              fileName: populatedMessage.fileName,
              fileType: populatedMessage.fileType,
              replyTo: populatedMessage.replyTo
            });
          }
        });
      }
    } catch (error) {
      console.error('Group message error:', error);
    }
  });

  // Delete message
  socket.on('delete-message', async (data: {
    messageId: string;
    userId: string;
    deleteForEveryone: boolean;
    receiverId?: string;
    groupId?: string;
  }) => {
    try {
      const { messageId, userId, deleteForEveryone, receiverId, groupId } = data;
      
      const message = await Message.findById(messageId);
      if (!message) return;

      if (deleteForEveryone && message.senderId.toString() === userId) {
        message.deletedForEveryone = true;
        await message.save();

        // Notify receiver or group members
        if (receiverId) {
          const receiverSocketId = userSockets.get(receiverId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('message-deleted', { messageId, deleteForEveryone: true });
          }
        } else if (groupId) {
          const group: any = await Group.findById(groupId);
          if (group) {
            group.members.forEach((memberId: any) => {
              const memberSocketId = userSockets.get(memberId.toString());
              if (memberSocketId && memberId.toString() !== userId) {
                io.to(memberSocketId).emit('message-deleted', { messageId, deleteForEveryone: true });
              }
            });
          }
        }
      } else {
        // Delete for self only
        if (!message.deletedFor) {
          message.deletedFor = [];
        }
        if (!message.deletedFor.some((id: any) => id.toString() === userId)) {
          message.deletedFor.push(userId as any);
        }
        await message.save();
      }

      socket.emit('message-delete-confirmed', { messageId, deleteForEveryone });
    } catch (error) {
      console.error('Delete message error:', error);
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

  // Add reaction
  socket.on('add-reaction', async (data: { messageId: string; emoji: string; userId: string }) => {
    try {
      const { messageId, emoji, userId } = data;
      
      // Get the message to find recipients
      const message = await Message.findById(messageId);
      if (!message) return;

      // Notify all relevant users about the reaction
      const recipients = [];
      
      if (message.receiverId) {
        // Private message
        recipients.push(message.senderId.toString(), message.receiverId.toString());
      } else if (message.groupId) {
        // Group message - get all group members
        const group = await Group.findById(message.groupId);
        if (group) {
          recipients.push(...group.members.map(m => m.toString()));
        }
      }

      // Emit to all recipients except the sender
      recipients.forEach(recipientId => {
        if (recipientId !== userId) {
          const recipientSocketId = userSockets.get(recipientId);
          if (recipientSocketId) {
            io.to(recipientSocketId).emit('reaction-added', {
              messageId,
              emoji,
              userId,
              reaction: { emoji, users: [userId], count: 1 }
            });
          }
        }
      });
    } catch (error) {
      console.error('Add reaction socket error:', error);
    }
  });

  // Remove reaction
  socket.on('remove-reaction', async (data: { messageId: string; emoji: string; userId: string }) => {
    try {
      const { messageId, emoji, userId } = data;
      
      // Get the message to find recipients
      const message = await Message.findById(messageId);
      if (!message) return;

      // Notify all relevant users about the reaction removal
      const recipients = [];
      
      if (message.receiverId) {
        // Private message
        recipients.push(message.senderId.toString(), message.receiverId.toString());
      } else if (message.groupId) {
        // Group message - get all group members
        const group = await Group.findById(message.groupId);
        if (group) {
          recipients.push(...group.members.map(m => m.toString()));
        }
      }

      // Emit to all recipients except the sender
      recipients.forEach(recipientId => {
        if (recipientId !== userId) {
          const recipientSocketId = userSockets.get(recipientId);
          if (recipientSocketId) {
            io.to(recipientSocketId).emit('reaction-removed', {
              messageId,
              emoji,
              userId
            });
          }
        }
      });
    } catch (error) {
      console.error('Remove reaction socket error:', error);
    }
  });

  // WebRTC Signaling - Call user
  socket.on('call-user', async (data: { callerId: string; receiverId: string; offer: any }) => {
    const { receiverId, offer, callerId } = data;
    
    try {
      // Create call history entry
      const callHistory = new CallHistory({
        callerId,
        receiverId,
        startTime: new Date(),
        status: 'no-answer',
        callType: 'voice'
      });
      await callHistory.save();
      
      // Store call history ID with unique call identifier
      const callId = `${callerId}-${receiverId}-${Date.now()}`;
      activeCalls.set(callId, (callHistory._id as any).toString());
      
      const receiverSocketId = userSockets.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('incoming-call', { callerId, offer, callId });
      } else {
        // Update call history as missed
        callHistory.status = 'missed';
        await callHistory.save();
        socket.emit('call-failed', { message: 'User tidak online' });
      }
    } catch (error) {
      console.error('Error creating call history:', error);
    }
  });

  // WebRTC Signaling - Answer call
  socket.on('answer-call', async (data: { callerId: string; receiverId: string; answer: any; callId?: string }) => {
    const { callerId, receiverId, answer, callId } = data;
    
    try {
      // Update call history status to completed
      if (callId && activeCalls.has(callId)) {
        const callHistoryId = activeCalls.get(callId);
        await CallHistory.findByIdAndUpdate(callHistoryId, {
          status: 'completed',
          startTime: new Date()
        });
      }
      
      const callerSocketId = userSockets.get(callerId);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call-answered', { receiverId, answer });
      }
    } catch (error) {
      console.error('Error updating call history on answer:', error);
    }
  });

  // WebRTC Signaling - ICE candidate (no logs — called 10-50x per call)
  socket.on('ice-candidate', (data: { targetUserId: string; senderId: string; candidate: any }) => {
    const { targetUserId, senderId, candidate } = data;
    const targetSocketId = userSockets.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('ice-candidate', { senderId, candidate });
    }
  });

  // Reject call
  socket.on('reject-call', async (data: { callerId: string; callId?: string }) => {
    const { callerId, callId } = data;
    
    try {
      // Update call history status to rejected
      if (callId && activeCalls.has(callId)) {
        const callHistoryId = activeCalls.get(callId);
        await CallHistory.findByIdAndUpdate(callHistoryId, {
          status: 'rejected',
          endTime: new Date()
        });
        activeCalls.delete(callId);
        console.log(`✅ Call history updated: ${callHistoryId} - status: rejected`);
      }
      
      const callerSocketId = userSockets.get(callerId);
      
      if (callerSocketId) {
        io.to(callerSocketId).emit('call-rejected');
      }
    } catch (error) {
      console.error('Error updating call history on reject:', error);
    }
  });

  // End call
  socket.on('end-call', async (data: { targetUserId: string; callId?: string; duration?: number }) => {
    const { targetUserId, callId, duration } = data;
    
    try {
      // Update call history with end time and duration
      if (callId && activeCalls.has(callId)) {
        const callHistoryId = activeCalls.get(callId);
        await CallHistory.findByIdAndUpdate(callHistoryId, {
          endTime: new Date(),
          duration: duration || 0
        });
        activeCalls.delete(callId);
        console.log(`✅ Call history updated: ${callHistoryId} - ended, duration: ${duration}s`);
      }
      
      const targetSocketId = userSockets.get(targetUserId);
      
      if (targetSocketId) {
        io.to(targetSocketId).emit('call-ended');
      }
    } catch (error) {
      console.error('Error updating call history on end:', error);
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

      // Cleanup stale active calls untuk mencegah memory leak
      for (const [callId, historyId] of activeCalls.entries()) {
        if (callId.startsWith(`${disconnectedUserId}-`) || callId.includes(`-${disconnectedUserId}-`)) {
          try {
            await CallHistory.findByIdAndUpdate(historyId, { status: 'missed', endTime: new Date() });
          } catch (_) { /* ignore */ }
          activeCalls.delete(callId);
        }
      }
    }
  });
});

// Start server
const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = '0.0.0.0'; // Listen on all network interfaces for Railway

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running on ${HOST}:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
});
