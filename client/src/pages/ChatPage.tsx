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
import SettingsModal from '../components/SettingsModal';
import PreferencesModal from '../components/PreferencesModal';
import AddContactModal from '../components/AddContactModal';
import { User, Group, Message } from '../types';
import { getAuthData, clearAuthData } from '../utils/auth';
import { useSocket } from '../context/SocketContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [contacts, setContacts] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const hasEmittedUserConnected = React.useRef(false);
  const [lastMessages, setLastMessages] = useState<{ [key: string]: Message }>({});
  
  // Group states
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  
  // Voice call states
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callRecipientId, setCallRecipientId] = useState<string>('');
  const [isCaller, setIsCaller] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState<RTCSessionDescriptionInit | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [showCallHistory, setShowCallHistory] = useState(false);

  // Profile states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  // Notification states
  const [missedCallsCount, setMissedCallsCount] = useState(0);

  // View mode: 'chat' or 'group'
  const [viewMode, setViewMode] = useState<'chat' | 'group'>('chat');

  // Mobile state
  const [showSidebar, setShowSidebar] = useState(true);

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
      return;
    }

    // Emit user-connected event only once
    if (!hasEmittedUserConnected.current) {
      socket.emit('user-connected', userId);
      hasEmittedUserConnected.current = true;
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
      setCallRecipientId(callerId);
      setIncomingOffer(offer);
      setCallId(incomingCallId || null);
      setIsCaller(false);
      setIsCallModalOpen(true);
    };

    // Listen for call ended to update missed calls count
    const handleCallEnded = ({ status, receiverId }: { status: string; receiverId: string }) => {
      if (status === 'missed' && receiverId === userId) {
        // Increment missed calls count
        setMissedCallsCount(prev => prev + 1);
      }
    };

    socket.on('user-status-changed', handleUserStatusChanged);
    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-ended', handleCallEnded);

    // Load contacts, groups, and missed calls
    loadContacts();
    loadGroups(userId);
    loadMissedCallsCount(userId);

    // Cleanup listeners on unmount
    return () => {
      socket.off('user-status-changed', handleUserStatusChanged);
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-ended', handleCallEnded);
    };
  }, [socket, isConnected, navigate]);

  const loadCurrentUser = async (userId: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/users/${userId}`);
      setCurrentUser(response.data);
    } catch (error) {
      // Error loading user
    }
  };

  const loadContacts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users`);
      const allUsers = response.data;
      
      // Filter users who have chat history with current user
      const contactsWithHistory: User[] = [];
      const lastMessagesMap: { [key: string]: Message } = {};
      
      for (const user of allUsers) {
        if (user._id !== currentUserId) {
          try {
            const messagesResponse = await axios.get(`${API_URL}/api/messages/${currentUserId}/${user._id}`);
            const messages = messagesResponse.data;
            
            // Only add to contacts if there's chat history
            if (messages.length > 0) {
              contactsWithHistory.push(user);
              lastMessagesMap[user._id] = messages[messages.length - 1];
            }
          } catch (error) {
            // Skip this user if error loading messages
          }
        }
      }
      
      setContacts(contactsWithHistory);
      setLastMessages(lastMessagesMap);
    } catch (error) {
      // Error loading contacts
    }
  };

  const loadGroups = async (userId: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/groups/user/${userId}`);
      setGroups(response.data);
    } catch (error) {
      // Error loading groups
    }
  };

  const loadMissedCallsCount = async (userId: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/call-history/${userId}`);
      
      // Get last viewed timestamp from localStorage
      const lastViewedKey = `callHistory_lastViewed_${userId}`;
      const lastViewed = localStorage.getItem(lastViewedKey);
      const lastViewedTime = lastViewed ? new Date(lastViewed).getTime() : 0;
      
      // Only count missed calls that occurred after last viewed time
      const missedCalls = response.data.filter((call: any) => {
        const callTime = new Date(call.createdAt).getTime();
        return call.status === 'missed' && 
               call.receiverId === userId && 
               callTime > lastViewedTime;
      });
      
      setMissedCallsCount(missedCalls.length);
    } catch (error) {
      // Error loading missed calls
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
    // Hide sidebar on mobile when chat selected
    setShowSidebar(false);
  };

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setSelectedUserId(null);
    setViewMode('group');
    // Hide sidebar on mobile when group selected
    setShowSidebar(false);
  };

  // Handler to update last message when a message is sent or received
  const handleMessageUpdate = async (message: Message, otherUserId: string) => {
    setLastMessages(prev => ({
      ...prev,
      [otherUserId]: message
    }));
    
    // If this is the first message with this user, add them to contacts
    const isInContacts = contacts.some(c => c._id === otherUserId);
    if (!isInContacts) {
      try {
        const response = await axios.get(`${API_URL}/api/users/${otherUserId}`);
        setContacts(prev => [...prev, response.data]);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    }
  };

  // Back to contacts (show sidebar on mobile)
  const handleBackToContacts = () => {
    setShowSidebar(true);
    // Don't clear selection, just show sidebar
  };

  const selectedRecipient = contacts.find(c => c._id === selectedUserId) || null;
  const callRecipient = contacts.find(c => c._id === callRecipientId) || null;
  const selectedGroup = groups.find(g => g._id === selectedGroupId) || null;

  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#2563EB] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#64748B]">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] px-4 py-2 flex items-center justify-between shadow-md flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1 overflow-hidden">
          {/* Mobile: Back button when chat is open */}
          {!showSidebar && (
            <button
              onClick={handleBackToContacts}
              className="md:hidden p-2 text-white/80 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Back to contacts"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          <img 
            src="/logo-chatly-putih.png" 
            alt="Chatly" 
            className="h-6 w-auto flex-shrink-0"
          />
          <h1 className="text-md font-bold text-white truncate">Chatly</h1>
        </div>
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <button
            onClick={() => {
              setShowCallHistory(true);
              setMissedCallsCount(0); // Reset count when opened
              
              // Save current timestamp to localStorage
              const lastViewedKey = `callHistory_lastViewed_${currentUserId}`;
              localStorage.setItem(lastViewedKey, new Date().toISOString());
            }}
            className="px-3 py-1.5 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 flex items-center gap-2 text-xs font-medium relative"
            title="Riwayat Panggilan"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden md:inline">Riwayat</span>
            {missedCallsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg">
                {missedCallsCount > 99 ? '99+' : missedCallsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowAddContact(true)}
            className="px-3 py-1.5 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 flex items-center gap-2 text-xs font-medium"
            title="Tambah Kontak"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span className="hidden md:inline">Tambah</span>
          </button>

          <button
            onClick={() => setShowCreateGroup(true)}
            className="px-3 py-1.5 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 flex items-center gap-2 text-xs font-medium"
            title="Buat Grup"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="hidden md:inline">Grup Baru</span>
          </button>
          
          <div className="h-6 w-px bg-white/20 mx-1"></div>
          
          <ProfileDropdown
            user={currentUser}
            onOpenProfile={() => setShowProfileModal(true)}
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenPreferences={() => setShowPreferencesModal(true)}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar - Responsive */}
        <div className={`
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          fixed md:relative
          inset-y-0 left-0
          w-full sm:w-96 md:w-80
          bg-white border-r border-[#64748B]/20
          flex flex-col
          transition-transform duration-300 ease-in-out
          z-30
          md:z-auto
          top-[57px] md:top-0
          overflow-hidden
        `}>
          {/* Tab Switcher */}
          <div className="flex border-b border-[#64748B]/20">
            <button
              onClick={() => {
                setViewMode('chat');
                // Reset group selection saat switch ke Chats
                setSelectedGroupId(null);
              }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                viewMode === 'chat'
                  ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              Obrolan
            </button>
            <button
              onClick={() => {
                setViewMode('group');
                // Reset chat selection saat switch ke Groups
                setSelectedUserId(null);
              }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                viewMode === 'group'
                  ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              Grup ({groups.length})
            </button>
          </div>

          {/* Content based on view mode */}
          {viewMode === 'chat' ? (
            <ContactList
              contacts={contacts}
              selectedUserId={selectedUserId}
              onSelectContact={handleSelectChat}
              currentUserId={currentUserId}
              lastMessages={lastMessages}
            />
          ) : (
            <div className="flex-1 overflow-y-auto p-2">
              {groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <svg className="w-16 h-16 text-[#64748B]/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-[#64748B] text-sm mb-4">Belum ada grup</p>
                  <button
                    onClick={() => setShowCreateGroup(true)}
                    className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm hover:bg-[#3B82F6] transition-colors shadow-lg"
                  >
                    Buat Grup
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
        
        {/* Chat Window - Responsive */}
        <div className={`
          flex-1
          ${showSidebar ? 'hidden md:flex' : 'flex'}
          flex-col
        `}>
          <ChatWindow
            recipientId={selectedUserId || ''}
            groupId={selectedGroupId || ''}
            currentUserId={currentUserId}
            recipient={selectedRecipient}
            group={selectedGroup}
            onStartCall={handleStartCall}
            viewMode={viewMode}
            onMessageUpdate={handleMessageUpdate}
          />
        </div>
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

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddContact}
        onClose={() => setShowAddContact(false)}
        onContactAdded={(user) => {
          // Add to contacts if not already there
          if (!contacts.find(c => c._id === user._id)) {
            setContacts(prev => [...prev, user]);
          }
          // Select the user to start chat
          setSelectedUserId(user._id);
          setViewMode('chat');
        }}
        currentUserId={currentUserId}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        currentUserId={currentUserId}
        contacts={contacts}
        onClose={() => setShowCreateGroup(false)}
        onGroupCreated={handleGroupCreated}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentUser={{
          username: currentUser?.username || '',
          email: currentUser?.email || ''
        }}
      />

      {/* Preferences Modal */}
      <PreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
      />
    </div>
  );
};

export default ChatPage;
