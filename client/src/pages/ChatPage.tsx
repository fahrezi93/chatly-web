import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import ContactList from '../components/ContactList';
import ChatWindow from '../components/ChatWindow';
import VoiceCallModal from '../components/VoiceCallModal';
import { User } from '../types';

const API_URL = 'http://localhost:5000';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Voice call states
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callRecipientId, setCallRecipientId] = useState<string>('');
  const [isCaller, setIsCaller] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      navigate('/');
      return;
    }

    setCurrentUserId(userId);

    // Initialize socket
    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('user-connected', userId);
    });

    // Listen for user status changes
    newSocket.on('user-status-changed', ({ userId: changedUserId, isOnline }) => {
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact._id === changedUserId 
            ? { ...contact, isOnline }
            : contact
        )
      );
    });

    // Listen for incoming calls
    newSocket.on('incoming-call', ({ callerId }) => {
      setCallRecipientId(callerId);
      setIsCaller(false);
      setIsCallModalOpen(true);
    });

    // Load contacts
    loadContacts();

    return () => {
      newSocket.close();
    };
  }, [navigate]);

  const loadContacts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users`);
      setContacts(response.data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const handleStartCall = (recipientId: string) => {
    setCallRecipientId(recipientId);
    setIsCaller(true);
    setIsCallModalOpen(true);
  };

  const handleCloseCall = () => {
    setIsCallModalOpen(false);
    setCallRecipientId('');
    setIsCaller(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const selectedRecipient = contacts.find(c => c._id === selectedUserId) || null;
  const callRecipient = contacts.find(c => c._id === callRecipientId) || null;

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Top Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Chat App</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-300">{localStorage.getItem('username')}</span>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            Keluar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ContactList
          contacts={contacts}
          selectedUserId={selectedUserId}
          onSelectContact={setSelectedUserId}
          currentUserId={currentUserId}
        />
        
        <ChatWindow
          recipientId={selectedUserId || ''}
          currentUserId={currentUserId}
          recipient={selectedRecipient}
          onStartCall={handleStartCall}
        />
      </div>

      {/* Voice Call Modal */}
      {isCallModalOpen && callRecipient && (
        <VoiceCallModal
          isOpen={isCallModalOpen}
          isCaller={isCaller}
          recipientName={callRecipient.username}
          recipientId={callRecipientId}
          currentUserId={currentUserId}
          socket={socket}
          onClose={handleCloseCall}
        />
      )}
    </div>
  );
};

export default ChatPage;
