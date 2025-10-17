import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ContactList from '../components/ContactList';
import ChatWindow from '../components/ChatWindow';
import VoiceCallModal from '../components/VoiceCallModal';
import { User } from '../types';
import { getAuthData, clearAuthData } from '../utils/auth';
import { useSocket } from '../context/SocketContext';

const API_URL = 'http://localhost:5000';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [contacts, setContacts] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  // Voice call states
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callRecipientId, setCallRecipientId] = useState<string>('');
  const [isCaller, setIsCaller] = useState(false);

  useEffect(() => {
    // Check authentication
    const { token, userId } = getAuthData();

    if (!token || !userId) {
      navigate('/');
      return;
    }

    setCurrentUserId(userId);

    // Only proceed if socket is ready
    if (!socket || !isConnected) {
      console.log('⏳ Waiting for socket connection...');
      return;
    }

    console.log('🎯 Setting up socket listeners for user:', userId);

    // Emit user-connected event
    socket.emit('user-connected', userId);

    // Listen for user status changes
    const handleUserStatusChanged = ({ userId: changedUserId, isOnline }: { userId: string; isOnline: boolean }) => {
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact._id === changedUserId 
            ? { ...contact, isOnline }
            : contact
        )
      );
    };

    // Listen for incoming calls
    const handleIncomingCall = ({ callerId }: { callerId: string; offer: any }) => {
      console.log('🔔 Incoming call from:', callerId);
      setCallRecipientId(callerId);
      setIsCaller(false);
      setIsCallModalOpen(true);
    };

    socket.on('user-status-changed', handleUserStatusChanged);
    socket.on('incoming-call', handleIncomingCall);

    // Load contacts
    loadContacts();

    // Cleanup listeners on unmount
    return () => {
      console.log('🧹 Removing socket listeners');
      socket.off('user-status-changed', handleUserStatusChanged);
      socket.off('incoming-call', handleIncomingCall);
    };
  }, [socket, isConnected, navigate]);

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
    // Emit disconnect event to server
    if (socket) {
      socket.emit('user-disconnected', currentUserId);
    }
    
    clearAuthData();
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
          <span className="text-gray-300">{getAuthData().username}</span>
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
