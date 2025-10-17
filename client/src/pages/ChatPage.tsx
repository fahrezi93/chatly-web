import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ContactList from '../components/ContactList';
import ChatWindow from '../components/ChatWindow';
import VoiceCallModal from '../components/VoiceCallModal';
import CallHistory from '../components/CallHistory';
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
  const hasEmittedUserConnected = React.useRef(false);
  
  // Voice call states
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callRecipientId, setCallRecipientId] = useState<string>('');
  const [isCaller, setIsCaller] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState<RTCSessionDescriptionInit | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [showCallHistory, setShowCallHistory] = useState(false);

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

    // Emit user-connected event only once
    if (!hasEmittedUserConnected.current) {
      console.log('📡 Emitting user-connected for:', userId);
      socket.emit('user-connected', userId);
      hasEmittedUserConnected.current = true;
    } else {
      console.log('⏭️ Skipping user-connected (already emitted)');
    }

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
    const handleIncomingCall = ({ callerId, offer, callId: incomingCallId }: { callerId: string; offer: RTCSessionDescriptionInit; callId?: string }) => {
      console.log('🔔 Incoming call from:', callerId);
      console.log('📦 Storing offer for processing in modal');
      setCallRecipientId(callerId);
      setIncomingOffer(offer);
      setCallId(incomingCallId || null);
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
    setIncomingOffer(null);
    setCallId(null);
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
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Top Header - Modern Minimalist */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-neutral-900">Messages</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCallHistory(true)}
            className="px-3 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
            title="Call History"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">History</span>
          </button>
          <div className="h-6 w-px bg-neutral-200 mx-1"></div>
          <div className="px-3 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg">
            {getAuthData().username}
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 text-sm font-medium"
          >
            Logout
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
          incomingOffer={incomingOffer}
          callId={callId}
          onClose={handleCloseCall}
        />
      )}

      {/* Call History Modal */}
      {showCallHistory && (
        <CallHistory
          currentUserId={currentUserId}
          onClose={() => setShowCallHistory(false)}
        />
      )}
    </div>
  );
};

export default ChatPage;
