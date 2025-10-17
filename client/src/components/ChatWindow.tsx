import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import Avatar from './Avatar';
import Button from './Button';
import { Message, User } from '../types';
import { 
  requestNotificationPermission, 
  showNotification, 
  playNotificationSound,
  incrementUnreadCount,
  clearUnreadCount
} from '../utils/notification';

interface ChatWindowProps {
  recipientId: string;
  currentUserId: string;
  recipient: User | null;
  onStartCall: (recipientId: string) => void;
}

const API_URL = 'http://localhost:5000';

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  recipientId, 
  currentUserId, 
  recipient,
  onStartCall 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isWindowFocused = useRef(true);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
    
    // Track window focus
    const handleFocus = () => {
      isWindowFocused.current = true;
      if (recipientId) {
        clearUnreadCount(recipientId);
      }
    };
    
    const handleBlur = () => {
      isWindowFocused.current = false;
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [recipientId]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('user-connected', currentUserId);
    });

    return () => {
      newSocket.close();
    };
  }, [currentUserId]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    socket.on('receive-message', (message: Message) => {
      if (message.senderId === recipientId) {
        setMessages((prev) => [...prev, message]);
        
        // Show notification if window is not focused
        if (!isWindowFocused.current && recipient) {
          showNotification(
            `Pesan baru dari ${recipient.username}`,
            {
              body: message.content,
              tag: message.senderId
            }
          );
          playNotificationSound();
          incrementUnreadCount(recipientId);
        }
      } else if (message.senderId !== currentUserId) {
        // Message from other user (not current chat)
        // Still increment unread and play sound
        playNotificationSound();
        incrementUnreadCount(message.senderId);
      }
    });

    socket.on('message-sent', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for messages read
    socket.on('messages-read', (data: { messageIds: string[]; readBy: string }) => {
      if (data.readBy === recipientId) {
        setMessages((prev) =>
          prev.map((msg) =>
            data.messageIds.includes(msg._id || msg.id || '')
              ? { ...msg, isRead: true, status: 'read' }
              : msg
          )
        );
      }
    });

    // Listen for typing indicator
    socket.on('user-typing', (data: { userId: string; isTyping: boolean }) => {
      if (data.userId === recipientId) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      socket.off('receive-message');
      socket.off('message-sent');
      socket.off('messages-read');
      socket.off('user-typing');
    };
  }, [socket, recipientId, recipient, currentUserId]);

  // Load messages when recipient changes
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/messages/${currentUserId}/${recipientId}`);
        const loadedMessages = response.data;
        setMessages(loadedMessages);
        
        // Clear unread count when opening chat
        clearUnreadCount(recipientId);
        
        // Mark unread messages as read
        const unreadMessageIds = loadedMessages
          .filter((msg: Message) => !msg.isRead && msg.receiverId === currentUserId)
          .map((msg: Message) => msg._id || msg.id);
        
        if (unreadMessageIds.length > 0 && socket) {
          socket.emit('mark-as-read', {
            messageIds: unreadMessageIds,
            receiverId: currentUserId,
            senderId: recipientId
          });
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    if (recipientId) {
      loadMessages();
    }
  }, [recipientId, currentUserId, socket]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!socket) return;
    
    // Emit typing event
    socket.emit('typing', {
      senderId: currentUserId,
      receiverId: recipientId,
      isTyping: true
    });
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', {
        senderId: currentUserId,
        receiverId: recipientId,
        isTyping: false
      });
    }, 2000);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !socket) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { fileUrl, filename, mimetype } = response.data;
      const messageType = mimetype.startsWith('image/') ? 'image' : 'file';

      // Send file message
      socket.emit('private-message', {
        senderId: currentUserId,
        receiverId: recipientId,
        content: messageType === 'image' ? '📷 Gambar' : `📎 ${filename}`,
        messageType,
        fileUrl: `${API_URL}${fileUrl}`,
        fileName: filename,
        fileType: mimetype
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Gagal mengupload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket) return;

    // Stop typing indicator
    socket.emit('typing', {
      senderId: currentUserId,
      receiverId: recipientId,
      isTyping: false
    });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit('private-message', {
      senderId: currentUserId,
      receiverId: recipientId,
      content: newMessage,
      messageType: 'text'
    });

    setNewMessage('');
    setShowEmojiPicker(false);
  };

  if (!recipient) {
    return (
      <div className="flex-1 bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Pilih kontak untuk memulai chat</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar username={recipient.username} isOnline={recipient.isOnline} />
          <div>
            <h3 className="text-white font-semibold">{recipient.username}</h3>
            <p className="text-sm text-gray-400">
              {recipient.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={() => onStartCall(recipientId)}
          className="flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Panggilan Suara
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isOwnMessage = message.senderId === currentUserId;
          
          return (
            <div
              key={message._id || message.id || index}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-lg rounded-lg overflow-hidden ${
                  isOwnMessage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-white'
                }`}
              >
                {/* Image message */}
                {message.messageType === 'image' && message.fileUrl && (
                  <div>
                    <img 
                      src={message.fileUrl} 
                      alt={message.fileName || 'Image'} 
                      className="max-w-full h-auto rounded cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(message.fileUrl, '_blank')}
                    />
                    <div className="px-4 py-2">
                      <p className="text-sm opacity-90">{message.content}</p>
                    </div>
                  </div>
                )}
                
                {/* File message */}
                {message.messageType === 'file' && message.fileUrl && (
                  <div className="px-4 py-2">
                    <a 
                      href={message.fileUrl} 
                      download={message.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:underline"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="font-medium">{message.fileName}</p>
                        <p className="text-xs opacity-70">{message.content}</p>
                      </div>
                    </a>
                  </div>
                )}
                
                {/* Text message */}
                {(!message.messageType || message.messageType === 'text') && (
                  <div className="px-4 py-2">
                    <p className="break-words">{message.content}</p>
                  </div>
                )}
                
                <div className="flex items-center gap-1 px-4 pb-2">
                  <p className="text-xs opacity-70">
                    {new Date(message.createdAt).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {isOwnMessage && (
                    <span className="text-xs opacity-70">
                      {message.isRead || message.status === 'read' ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-800 border-t border-gray-700">
        {isTyping && (
          <div className="px-4 pt-2 text-sm text-gray-400 italic">
            {recipient?.username} sedang mengetik...
          </div>
        )}
        
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 z-50">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="p-4">
          <div className="flex gap-2 items-center">
            {/* File Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              title="Kirim file"
            >
              {uploading ? (
                <svg className="animate-spin w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              )}
            </button>
            
            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Emoji"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            {/* Text Input */}
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Ketik pesan..."
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            
            {/* Send Button */}
            <Button type="submit" disabled={!newMessage.trim()}>
              Kirim
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
