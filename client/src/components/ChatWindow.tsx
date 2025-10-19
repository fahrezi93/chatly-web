import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import Avatar from './Avatar';
import MessageItem from './MessageItem';
import { Message, User, Group } from '../types';
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
  groupId?: string;
  currentUserId: string;
  recipient: User | null;
  group?: Group | null;
  onStartCall: (recipientId: string) => void;
  viewMode?: 'chat' | 'group';
}

const API_URL = 'http://localhost:5000';

// Helper function to format last seen time
const formatLastSeen = (lastSeen: Date | undefined): string => {
  if (!lastSeen) return 'Tidak diketahui';
  
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffMs = now.getTime() - lastSeenDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  
  return lastSeenDate.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  recipientId, 
  groupId = '',
  currentUserId, 
  recipient,
  group = null,
  onStartCall,
  viewMode = 'chat'
}) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isWindowFocused = useRef(true);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otherUserTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      const messageSenderId = typeof message.senderId === 'object' && message.senderId && '_id' in message.senderId
        ? message.senderId._id
        : message.senderId;
        
      if (messageSenderId === recipientId) {
        setMessages((prev) => [...prev, message]);
        
        // Mark message as read immediately if chat is open
        if (socket && (message._id || message.id)) {
          socket.emit('mark-as-read', {
            messageIds: [message._id || message.id],
            receiverId: currentUserId,
            senderId: recipientId
          });
        }
        
        // Show notification if window is not focused
        if (!isWindowFocused.current && recipient) {
          showNotification(
            `Pesan baru dari ${recipient.username}`,
            {
              body: message.content,
              tag: messageSenderId
            }
          );
          playNotificationSound();
          incrementUnreadCount(recipientId);
        } else {
          // Clear unread count if window is focused
          clearUnreadCount(recipientId);
        }
      } else if (messageSenderId !== currentUserId) {
        // Message from other user (not current chat)
        // Still increment unread and play sound
        playNotificationSound();
        incrementUnreadCount(messageSenderId);
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

    // Listen for group messages
    socket.on('group-message-received', (message: Message) => {
      if (viewMode === 'group' && message.groupId === groupId) {
        setMessages((prev) => [...prev, message]);
        
        // Show notification if window is not focused
        if (!isWindowFocused.current && group) {
          showNotification(
            `Pesan baru di ${group.name}`,
            {
              body: message.content,
              tag: message.groupId
            }
          );
          playNotificationSound();
        }
      }
    });

    // Listen for message deleted
    socket.on('message-deleted', ({ 
      messageId, 
      userId, 
      deleteForEveryone 
    }: { 
      messageId: string; 
      userId: string; 
      deleteForEveryone: boolean 
    }) => {
      setMessages(prev => 
        prev.map(msg => {
          if (msg._id === messageId || msg.id === messageId) {
            if (deleteForEveryone) {
              // Delete for everyone - semua user lihat sebagai deleted
              return { ...msg, deletedForEveryone: true };
            } else {
              // Delete for me - hanya user yang delete yang lihat sebagai deleted
              const deletedForArray = msg.deletedFor || [];
              if (!deletedForArray.includes(userId)) {
                return { 
                  ...msg, 
                  deletedFor: [...deletedForArray, userId] 
                };
              }
            }
          }
          return msg;
        })
      );
    });

    // Listen for typing indicator
    socket.on('user-typing', ({ senderId, isTyping: typing }: { senderId: string; isTyping: boolean }) => {
      if (senderId === recipientId) {
        setOtherUserTyping(typing);
        
        // Auto-hide typing indicator after 3 seconds
        if (typing) {
          if (otherUserTypingTimeoutRef.current) {
            clearTimeout(otherUserTypingTimeoutRef.current);
          }
          otherUserTypingTimeoutRef.current = setTimeout(() => {
            setOtherUserTyping(false);
          }, 3000);
        }
      }
    });

    return () => {
      socket.off('receive-message');
      socket.off('message-sent');
      socket.off('messages-read');
      socket.off('user-typing');
      socket.off('group-message-received');
      socket.off('message-deleted');
    };
  }, [socket, recipientId, recipient, currentUserId, viewMode, groupId, group]);

  // Load messages when recipient or group changes
  useEffect(() => {
    const loadMessages = async () => {
      try {
        if (viewMode === 'group' && groupId) {
          // Load group messages
          const response = await axios.get(`${API_URL}/api/groups/${groupId}/messages`);
          setMessages(response.data);
        } else if (recipientId) {
          // Load private messages
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
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    if (recipientId || groupId) {
      loadMessages();
      // Reset reply state when switching chats
      setReplyingTo(null);
    }
  }, [recipientId, groupId, viewMode, currentUserId, socket]);

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

    if (viewMode === 'group' && groupId) {
      // Send group message
      socket.emit('group-message', {
        groupId,
        senderId: currentUserId,
        content: newMessage,
        replyTo: replyingTo?._id || replyingTo?.id || null
      });
    } else {
      // Send private message
      socket.emit('private-message', {
        senderId: currentUserId,
        receiverId: recipientId,
        content: newMessage,
        messageType: 'text',
        replyTo: replyingTo?._id || replyingTo?.id || null
      });
    }

    setNewMessage('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const handleDelete = async (messageId: string, deleteForEveryone: boolean) => {
    try {
      // Update local state immediately for better UX
      setMessages(prev => 
        prev.map(msg => {
          if (msg._id === messageId || msg.id === messageId) {
            if (deleteForEveryone) {
              return { ...msg, deletedForEveryone: true };
            } else {
              const deletedForArray = msg.deletedFor || [];
              return { 
                ...msg, 
                deletedFor: [...deletedForArray, currentUserId] 
              };
            }
          }
          return msg;
        })
      );

      // Then call API
      await axios.delete(`${API_URL}/api/messages/${messageId}`, {
        data: { userId: currentUserId, deleteForEveryone }
      });
      
      // Emit socket event to notify other users
      socket?.emit('delete-message', {
        messageId,
        userId: currentUserId,
        deleteForEveryone
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      // Revert on error
      setMessages(prev => 
        prev.map(msg => {
          if (msg._id === messageId || msg.id === messageId) {
            if (deleteForEveryone) {
              return { ...msg, deletedForEveryone: false };
            } else {
              const deletedForArray = (msg.deletedFor || []).filter(id => id !== currentUserId);
              return { ...msg, deletedFor: deletedForArray };
            }
          }
          return msg;
        })
      );
    }
  };

  const handlePin = async (messageId: string) => {
    try {
      // Update local state to mark message as pinned
      setMessages(prev => 
        prev.map(msg => {
          if (msg._id === messageId || msg.id === messageId) {
            return { ...msg, isPinned: !msg.isPinned };
          }
          return msg;
        })
      );

      // Call API to pin/unpin message
      await axios.post(`${API_URL}/api/messages/${messageId}/pin`, {
        userId: currentUserId
      });
      
      // Emit socket event to notify other users
      socket?.emit('pin-message', {
        messageId,
        userId: currentUserId
      });
    } catch (error) {
      console.error('Error pinning message:', error);
      // Revert on error
      setMessages(prev => 
        prev.map(msg => {
          if (msg._id === messageId || msg.id === messageId) {
            return { ...msg, isPinned: !msg.isPinned };
          }
          return msg;
        })
      );
    }
  };

  if (!recipient && !group) {
    return (
      <div className="flex-1 bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-24 h-24 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-neutral-500 text-base font-medium">
            {viewMode === 'group' ? 'Select a group to start chatting' : 'Select a contact to start chatting'}
          </p>
          <p className="text-neutral-400 text-sm mt-2">
            {viewMode === 'group' ? 'Choose from your groups on the left' : 'Choose from your contacts on the left'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-3 md:px-6 py-3 md:py-4 bg-white border-b border-neutral-200 flex items-center justify-between shadow-soft flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1 overflow-hidden">
          {viewMode === 'group' && group ? (
            <>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold shadow-soft flex-shrink-0">
                {group.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <h3 className="text-neutral-900 font-semibold text-sm truncate">{group.name}</h3>
                <p className="text-xs text-neutral-500">
                  {Array.isArray(group.members) ? group.members.length : 0} members
                </p>
              </div>
            </>
          ) : recipient ? (
            <>
              <Avatar username={recipient.username} isOnline={recipient.isOnline} />
              <div className="min-w-0 flex-1 overflow-hidden">
                <h3 className="text-neutral-900 font-semibold text-sm truncate">{recipient.username}</h3>
                <p className={`text-xs flex items-center gap-1 truncate ${
                  recipient.isOnline ? 'text-emerald-600' : 'text-neutral-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    recipient.isOnline ? 'bg-emerald-500' : 'bg-neutral-400'
                  }`}></span>
                  {recipient.isOnline ? (
                    otherUserTyping ? 'sedang mengetik...' : 'Online'
                  ) : (
                    `Terakhir dilihat ${formatLastSeen(recipient.lastSeen)}`
                  )}
                </p>
              </div>
            </>
          ) : null}
        </div>
        
        {/* Action buttons - Voice call only for private chat, Group info for group */}
        {group && viewMode === 'group' ? (
          <button
            className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-all duration-200"
            title="Info Grup"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        ) : recipient ? (
          <button
            onClick={() => onStartCall(recipientId)}
            className="px-3 md:px-4 py-1.5 md:py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all duration-200 flex items-center gap-1 md:gap-2 text-xs md:text-sm font-medium shadow-soft"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="hidden sm:inline">Voice Call</span>
          </button>
        ) : null}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 bg-neutral-50">
        {messages.map((message, index) => {
          // Determine if message.senderId is a string or object
          const messageSenderId = typeof message.senderId === 'object' && message.senderId && '_id' in message.senderId
            ? message.senderId._id
            : message.senderId;
          
          return (
            <MessageItem
              key={message._id || message.id || index}
              message={message}
              isOwnMessage={messageSenderId === currentUserId}
              currentUserId={currentUserId}
              onReply={handleReply}
              onDelete={handleDelete}
              onPin={handlePin}
              showSenderName={viewMode === 'group'}
            />
          );
        })}
        
        {/* Typing Indicator */}
        {otherUserTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-soft border border-neutral-100 flex items-center gap-2">
              <span className="text-sm text-neutral-600">
                {recipient?.username || 'User'} sedang mengetik
              </span>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-neutral-200">
        {/* Reply Preview */}
        {replyingTo && (
          <div className="px-3 md:px-6 pt-2 md:pt-3 pb-1.5 md:pb-2 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between gap-2 flex-shrink-0">
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <p className="text-xs font-medium text-neutral-700">Membalas ke</p>
              </div>
              <p className="text-sm text-neutral-600 truncate">{replyingTo.content}</p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {isTyping && (
          <div className="px-3 md:px-6 pt-2 md:pt-3 text-xs text-neutral-500 flex items-center gap-2">
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
          <div className="absolute bottom-20 md:bottom-24 right-3 md:right-6 z-50 shadow-large rounded-lg">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="p-2 md:p-4 flex-shrink-0">
          <div className="flex gap-1.5 md:gap-2 items-center bg-neutral-100 rounded-2xl px-2 md:px-4 py-1.5 md:py-2 overflow-hidden">
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
              className="flex-1 min-w-0 px-2 py-2 bg-transparent text-neutral-900 placeholder-neutral-400 focus:outline-none text-sm"
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
