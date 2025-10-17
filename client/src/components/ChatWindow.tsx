import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import Avatar from './Avatar';
import Button from './Button';
import { Message, User } from '../types';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      }
    });

    socket.on('message-sent', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('receive-message');
      socket.off('message-sent');
    };
  }, [socket, recipientId]);

  // Load messages when recipient changes
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/messages/${currentUserId}/${recipientId}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    if (recipientId) {
      loadMessages();
    }
  }, [recipientId, currentUserId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket) return;

    socket.emit('private-message', {
      senderId: currentUserId,
      receiverId: recipientId,
      content: newMessage
    });

    setNewMessage('');
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
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                  isOwnMessage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-white'
                }`}
              >
                <p className="break-words">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.createdAt).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            Kirim
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
