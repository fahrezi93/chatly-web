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
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

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

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Map to store userId -> socketId
const userSockets = new Map<string, string>();

// Map to store active calls: callId -> callHistoryId
const activeCalls = new Map<string, string>();

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

// Get call history for a user
app.get('/api/call-history/:userId', async (req: Request, res: Response) => {
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
app.post('/api/upload', upload.single('file'), async (req: Request, res: Response) => {
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
app.get('/api/users/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId, { password: 0 });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
app.put('/api/users/:userId', upload.single('profilePicture'), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { username, email, bio, status } = req.body;

    const updateData: any = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
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
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete message
app.delete('/api/messages/:messageId', async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { userId, deleteForEveryone } = req.body;

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
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
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
app.post('/api/messages/:messageId/pin', async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
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
app.post('/api/messages/:messageId/reaction', async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { emoji, userId } = req.body;

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
      if (!existingReaction.users.includes(userId)) {
        existingReaction.users.push(userId);
        existingReaction.count = existingReaction.users.length;
      }
    } else {
      // Create new reaction
      message.reactions.push({
        emoji,
        users: [userId],
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
app.delete('/api/messages/:messageId/reaction', async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { emoji, userId } = req.body;

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
app.post('/api/groups', async (req: Request, res: Response) => {
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
app.get('/api/groups/user/:userId', async (req: Request, res: Response) => {
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
app.get('/api/groups/:groupId', async (req: Request, res: Response) => {
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
app.get('/api/groups/:groupId/messages', async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    const messages = await Message.find({ groupId })
      .populate('senderId', '-password')
      .populate('replyTo')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Get group messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add member to group
app.post('/api/groups/:groupId/members', async (req: Request, res: Response) => {
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
app.delete('/api/groups/:groupId/members/:userId', async (req: Request, res: Response) => {
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
app.put('/api/groups/:groupId', upload.single('groupPicture'), async (req: Request, res: Response) => {
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
    replyTo?: string;
  }) => {
    try {
      const { senderId, receiverId, content, messageType, fileUrl, fileName, fileType, replyTo } = data;

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

  // Group message
  socket.on('group-message', async (data: {
    senderId: string;
    groupId: string;
    content: string;
    messageType?: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    replyTo?: string;
  }) => {
    try {
      const { senderId, groupId, content, messageType, fileUrl, fileName, fileType, replyTo } = data;

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
    console.log(`📞 Call from ${callerId} to ${receiverId}`);
    
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
      
      console.log(`📝 Call history created: ${callHistory._id}`);
      
      const receiverSocketId = userSockets.get(receiverId);
      console.log(`Receiver socket ID: ${receiverSocketId}`);
      console.log(`Current userSockets map:`, Array.from(userSockets.entries()));
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('incoming-call', { callerId, offer, callId });
        console.log(`✅ Incoming call event sent to ${receiverId} (socket: ${receiverSocketId})`);
      } else {
        console.log(`❌ Receiver ${receiverId} not found in userSockets`);
        // Update call history as missed
        callHistory.status = 'missed';
        await callHistory.save();
        // Send error back to caller
        socket.emit('call-failed', { message: 'User tidak online' });
      }
    } catch (error) {
      console.error('Error creating call history:', error);
    }
  });

  // WebRTC Signaling - Answer call
  socket.on('answer-call', async (data: { callerId: string; receiverId: string; answer: any; callId?: string }) => {
    const { callerId, receiverId, answer, callId } = data;
    console.log(`📱 Answer from ${receiverId} to caller ${callerId}`);
    
    try {
      // Update call history status to completed
      if (callId && activeCalls.has(callId)) {
        const callHistoryId = activeCalls.get(callId);
        await CallHistory.findByIdAndUpdate(callHistoryId, {
          status: 'completed',
          startTime: new Date() // Update actual start time when answered
        });
        console.log(`✅ Call history updated: ${callHistoryId} - status: completed`);
      }
      
      const callerSocketId = userSockets.get(callerId);
      console.log(`Caller socket ID: ${callerSocketId}`);
      
      if (callerSocketId) {
        io.to(callerSocketId).emit('call-answered', { receiverId, answer });
        console.log(`✅ Call answered event sent to ${callerId} (socket: ${callerSocketId})`);
      } else {
        console.log(`❌ Caller ${callerId} not found in userSockets`);
      }
    } catch (error) {
      console.error('Error updating call history on answer:', error);
    }
  });

  // WebRTC Signaling - ICE candidate
  socket.on('ice-candidate', (data: { targetUserId: string; senderId: string; candidate: any }) => {
    const { targetUserId, senderId, candidate } = data;
    const targetSocketId = userSockets.get(targetUserId);
    
    console.log(`🧊 ICE candidate from ${senderId} to ${targetUserId}`);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('ice-candidate', { senderId, candidate });
      console.log(`✅ ICE candidate sent to ${targetUserId}`);
    } else {
      console.log(`❌ Target ${targetUserId} not found for ICE candidate`);
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
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
