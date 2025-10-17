import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import Avatar from './Avatar';
import { Message, User } from '../types';
import { 
  requestNotificationPermission, 
  showNotification, 
  playNotificationSound,
  incrementUnreadCount,
  clearUnreadCount
} from '../utils/notification';
import { useSocket } from '../context/SocketContext';

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
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
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
      <div className="flex-1 bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-24 h-24 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-neutral-500 text-base font-medium">Select a contact to start chatting</p>
          <p className="text-neutral-400 text-sm mt-2">Choose from your contacts on the left</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-neutral-200 flex items-center justify-between shadow-soft">
        <div className="flex items-center gap-3">
          <Avatar username={recipient.username} isOnline={recipient.isOnline} />
          <div>
            <h3 className="text-neutral-900 font-semibold text-sm">{recipient.username}</h3>
            <p className={`text-xs flex items-center gap-1 ${
              recipient.isOnline ? 'text-emerald-600' : 'text-neutral-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                recipient.isOnline ? 'bg-emerald-500' : 'bg-neutral-300'
              }`}></span>
              {recipient.isOnline ? 'Active now' : 'Offline'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => onStartCall(recipientId)}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-soft"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="hidden sm:inline">Voice Call</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-neutral-50">
        {messages.map((message, index) => {
          const isOwnMessage = message.senderId === currentUserId;
          
          return (
            <div
              key={message._id || message.id || index}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-lg rounded-2xl overflow-hidden ${
                  isOwnMessage
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-neutral-900 shadow-soft border border-neutral-100'
                }`}
              >
                {/* Image message */}
                {message.messageType === 'image' && message.fileUrl && (
                  <div>
                    <img 
                      src={message.fileUrl} 
                      alt={message.fileName || 'Image'} 
                      className="max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(message.fileUrl, '_blank')}
                    />
                    <div className="px-4 py-2">
                      <p className={`text-sm ${isOwnMessage ? 'text-white/90' : 'text-neutral-600'}`}>
                        {message.content}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* File message */}
                {message.messageType === 'file' && message.fileUrl && (
                  <div className="px-4 py-3">
                    <a 
                      href={message.fileUrl} 
                      download={message.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <div className={`p-2 rounded-lg ${
                        isOwnMessage ? 'bg-white/20' : 'bg-neutral-100'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{message.fileName}</p>
                        <p className={`text-xs ${isOwnMessage ? 'text-white/70' : 'text-neutral-500'}`}>
                          {message.content}
                        </p>
                      </div>
                    </a>
                  </div>
                )}
                
                {/* Text message */}
                {(!message.messageType || message.messageType === 'text') && (
                  <div className="px-4 py-2.5">
                    <p className="break-words text-sm leading-relaxed">{message.content}</p>
                  </div>
                )}
                
                <div className="flex items-center gap-1 px-4 pb-2">
                  <p className={`text-xs ${isOwnMessage ? 'text-white/70' : 'text-neutral-400'}`}>
                    {new Date(message.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {isOwnMessage && (
                    <span className="text-xs text-white/70 ml-1">
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
      <div className="bg-white border-t border-neutral-200">
        {isTyping && (
          <div className="px-6 pt-3 text-xs text-neutral-500 flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span>{recipient?.username} is typing...</span>
          </div>
        )}
        
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-24 right-6 z-50 shadow-large rounded-lg">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="p-4">
          <div className="flex gap-2 items-center bg-neutral-100 rounded-2xl px-4 py-2">
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
              className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-white rounded-lg transition-all duration-200 disabled:opacity-50"
              title="Send file"
            >
              {uploading ? (
                <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              )}
            </button>
            
            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-white rounded-lg transition-all duration-200"
              title="Emoji"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            {/* Text Input */}
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="flex-1 px-2 py-2 bg-transparent text-neutral-900 placeholder-neutral-400 focus:outline-none text-sm"
            />
            
            {/* Send Button */}
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className={`p-2 rounded-lg transition-all duration-200 ${
                newMessage.trim() 
                  ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-soft' 
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
