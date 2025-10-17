import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ContactList from '../components/ContactList';
import ChatWindow from '../components/ChatWindow';
import VoiceCallModal from '../components/VoiceCallModal';
import CallHistory from '../components/CallHistory';
import ProfileDropdown from '../components/ProfileDropdown';
import ProfileModal from '../components/ProfileModal';
import CreateGroupModal from '../components/CreateGroupModal';
import { User, Group } from '../types';
import { getAuthData, clearAuthData } from '../utils/auth';
import { useSocket } from '../context/SocketContext';

const API_URL = 'http://localhost:5000';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [contacts, setContacts] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const hasEmittedUserConnected = React.useRef(false);
  
  // Group states
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  
  // Voice call states
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callRecipientId, setCallRecipientId] = useState<string>('');
  const [isCaller, setIsCaller] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState<RTCSessionDescriptionInit | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [showCallHistory, setShowCallHistory] = useState(false);

  // Profile states
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Notification states
  const [missedCallsCount, setMissedCallsCount] = useState(0);

  // View mode: 'chat' or 'group'
  const [viewMode, setViewMode] = useState<'chat' | 'group'>('chat');

  useEffect(() => {
    // Check authentication
    const { token, userId } = getAuthData();

    if (!token || !userId) {
      navigate('/');
      return;
    }

    setCurrentUserId(userId);
    loadCurrentUser(userId);

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

    // Load contacts, groups, and missed calls
    loadContacts();
    loadGroups(userId);
    loadMissedCallsCount(userId);

    // Cleanup listeners on unmount
    return () => {
      console.log('🧹 Removing socket listeners');
      socket.off('user-status-changed', handleUserStatusChanged);
      socket.off('incoming-call', handleIncomingCall);
    };
  }, [socket, isConnected, navigate]);

  const loadCurrentUser = async (userId: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/users/${userId}`);
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadContacts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users`);
      setContacts(response.data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadGroups = async (userId: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/groups/user/${userId}`);
      setGroups(response.data);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const loadMissedCallsCount = async (userId: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/call-history/${userId}`);
      const missedCalls = response.data.filter((call: any) => 
        call.status === 'missed' && call.receiverId === userId
      );
      setMissedCallsCount(missedCalls.length);
    } catch (error) {
      console.error('Error loading missed calls:', error);
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

  const handleGroupCreated = (group: Group) => {
    setGroups(prev => [group, ...prev]);
    setSelectedGroupId(group._id);
    setViewMode('group');
  };

  const handleSelectChat = (userId: string) => {
    setSelectedUserId(userId);
    setSelectedGroupId(null);
    setViewMode('chat');
  };

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setSelectedUserId(null);
    setViewMode('group');
  };

  const selectedRecipient = contacts.find(c => c._id === selectedUserId) || null;
  const callRecipient = contacts.find(c => c._id === callRecipientId) || null;
  const selectedGroup = groups.find(g => g._id === selectedGroupId) || null;

  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Top Header */}
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
            onClick={() => {
              setShowCallHistory(true);
              setMissedCallsCount(0); // Reset count when opened
            }}
            className="px-3 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium relative"
            title="Call History"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">History</span>
            {missedCallsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-soft">
                {missedCallsCount > 99 ? '99+' : missedCallsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowCreateGroup(true)}
            className="px-3 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
            title="Create Group"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="hidden sm:inline">New Group</span>
          </button>
          
          <div className="h-6 w-px bg-neutral-200 mx-1"></div>
          
          <ProfileDropdown
            user={currentUser}
            onOpenProfile={() => setShowProfileModal(true)}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-white border-r border-neutral-200 flex flex-col">
          {/* Tab Switcher */}
          <div className="flex border-b border-neutral-200">
            <button
              onClick={() => setViewMode('chat')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                viewMode === 'chat'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Chats
            </button>
            <button
              onClick={() => setViewMode('group')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                viewMode === 'group'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Groups ({groups.length})
            </button>
          </div>

          {/* Content based on view mode */}
          {viewMode === 'chat' ? (
            <ContactList
              contacts={contacts}
              selectedUserId={selectedUserId}
              onSelectContact={handleSelectChat}
              currentUserId={currentUserId}
            />
          ) : (
            <div className="flex-1 overflow-y-auto p-2">
              {groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <svg className="w-16 h-16 text-neutral-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-neutral-500 text-sm mb-4">No groups yet</p>
                  <button
                    onClick={() => setShowCreateGroup(true)}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
                  >
                    Create Group
                  </button>
                </div>
              ) : (
                groups.map(group => (
                  <div
                    key={group._id}
                    onClick={() => handleSelectGroup(group._id)}
                    className={`px-4 py-3 mx-2 mb-1 flex items-center gap-3 cursor-pointer transition-all duration-200 rounded-lg ${
                      selectedGroupId === group._id 
                        ? 'bg-primary-50 shadow-soft' 
                        : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold shadow-soft">
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-neutral-900 truncate">
                        {group.name}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {Array.isArray(group.members) ? group.members.length : 0} members
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        <ChatWindow
          recipientId={selectedUserId || ''}
          groupId={selectedGroupId || ''}
          currentUserId={currentUserId}
          recipient={selectedRecipient}
          group={selectedGroup}
          onStartCall={handleStartCall}
          viewMode={viewMode}
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

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        user={currentUser}
        onClose={() => setShowProfileModal(false)}
        onUpdate={(updatedUser) => {
          setCurrentUser(updatedUser);
          loadContacts(); // Reload to show updated profile in contacts
        }}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        currentUserId={currentUserId}
        contacts={contacts}
        onClose={() => setShowCreateGroup(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
};

export default ChatPage;
