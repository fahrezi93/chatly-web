import React, { useState, useEffect, useRef } from 'react';
import Avatar from './Avatar';
import VerifiedBadge from './VerifiedBadge';
import { User, Message } from '../types';
import { getUnreadCount } from '../utils/notification';

// Helper function to format last seen time
const formatLastSeen = (lastSeen: Date | undefined): string => {
  if (!lastSeen) return 'Offline';
  
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffMs = now.getTime() - lastSeenDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins}m yang lalu`;
  if (diffHours < 24) return `${diffHours}j yang lalu`;
  
  return lastSeenDate.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short'
  });
};

interface ContactListProps {
  contacts: User[];
  selectedUserId: string | null;
  onSelectContact: (userId: string) => void;
  currentUserId: string;
  lastMessages?: { [key: string]: Message };
}

const ContactList: React.FC<ContactListProps> = ({ 
  contacts, 
  selectedUserId, 
  onSelectContact,
  currentUserId,
  lastMessages = {} 
}) => {
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
  const [highlightedContact, setHighlightedContact] = useState<string | null>(null);
  const previousOrderRef = useRef<string[]>([]);
  
  // Filter out current user from contacts and sort by last message
  const filteredContacts = contacts
    .filter(contact => contact._id !== currentUserId)
    .sort((a, b) => {
      const lastMessageA = lastMessages[a._id];
      const lastMessageB = lastMessages[b._id];
      
      // If both have messages, sort by timestamp
      if (lastMessageA && lastMessageB) {
        const timeA = new Date(lastMessageA.timestamp || lastMessageA.createdAt || 0).getTime();
        const timeB = new Date(lastMessageB.timestamp || lastMessageB.createdAt || 0).getTime();
        return timeB - timeA; // Most recent first
      }
      
      // If only A has message, A comes first
      if (lastMessageA) return -1;
      
      // If only B has message, B comes first
      if (lastMessageB) return 1;
      
      // If neither has messages, maintain original order
      return 0;
    });
  
  // Detect when contact order changes and highlight the moved contact
  useEffect(() => {
    const currentOrder = filteredContacts.map(c => c._id);
    const previousOrder = previousOrderRef.current;
    
    if (previousOrder.length > 0 && currentOrder.length > 0) {
      // Check if first contact changed (someone moved to top)
      if (currentOrder[0] !== previousOrder[0]) {
        const movedContactId = currentOrder[0];
        setHighlightedContact(movedContactId);
        
        // Remove highlight after animation
        setTimeout(() => {
          setHighlightedContact(null);
        }, 1000);
      }
    }
    
    previousOrderRef.current = currentOrder;
  }, [filteredContacts]);
  
  // Update unread counts periodically
  useEffect(() => {
    const updateUnreadCounts = () => {
      const counts: { [key: string]: number } = {};
      contacts.forEach(contact => {
        if (contact._id !== currentUserId) {
          counts[contact._id] = getUnreadCount(contact._id);
        }
      });
      setUnreadCounts(counts);
    };
    
    updateUnreadCounts();
    const interval = setInterval(updateUnreadCounts, 1000);
    
    return () => clearInterval(interval);
  }, [contacts, currentUserId]); // Fixed dependency

  return (
    <div className="w-full flex flex-col h-full">
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-[#64748B]/10">
        <h2 className="text-sm md:text-base font-bold text-[#1E293B]">Kontak</h2>
        <p className="text-xs text-[#64748B] mt-1">{filteredContacts.length} kontak</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <svg className="w-16 h-16 text-[#64748B]/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-[#64748B] text-sm">Belum ada kontak</p>
          </div>
        ) : (
          <div className="py-1 md:py-2">
            {filteredContacts.map((contact) => {
              const unreadCount = unreadCounts[contact._id] || 0;
              const lastMessage = lastMessages[contact._id];
              const isHighlighted = highlightedContact === contact._id;
              
              return (
                <div
                  key={contact._id}
                  onClick={() => onSelectContact(contact._id)}
                  style={{
                    animation: isHighlighted ? 'slideInFromTop 0.5s ease-out, highlightPulse 1s ease-out' : undefined,
                    transformOrigin: 'top'
                  }}
                  className={`px-3 md:px-4 py-2.5 md:py-3 mx-1 md:mx-2 mb-1 flex items-center gap-2 md:gap-3 cursor-pointer transition-all duration-300 rounded-lg ${
                    selectedUserId === contact._id 
                      ? 'bg-[#2563EB]/10 border-l-4 border-[#2563EB]' 
                      : isHighlighted
                      ? 'bg-[#10B981]/10'
                      : 'hover:bg-[#64748B]/5'
                  }`}
                >
                  <Avatar username={contact.username} isOnline={contact.isOnline} profilePicture={contact.profilePicture} isVerified={contact.isVerified} />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between mb-0.5 gap-2">
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <p className={`font-semibold truncate text-sm ${
                          selectedUserId === contact._id ? 'text-[#2563EB]' : 'text-[#1E293B]'
                        }`}>
                          {contact.displayName || contact.username}
                        </p>
                        {contact.isVerified && <VerifiedBadge size="sm" />}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {lastMessage && (
                          <span className="text-[10px] text-[#64748B]">
                            {formatLastSeen(new Date(lastMessage.timestamp || lastMessage.createdAt))}
                          </span>
                        )}
                        {unreadCount > 0 && (
                          <span className="bg-[#2563EB] text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center shadow-sm">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs truncate text-[#64748B]">
                      {lastMessage ? (
                        lastMessage.fileUrl ? (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            File
                          </span>
                        ) : (
                          lastMessage.content
                        )
                      ) : (
                        <span className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${
                            contact.isOnline ? 'bg-[#10B981]' : 'bg-[#64748B]'
                          }`}></span>
                          {contact.isOnline ? 'Online' : formatLastSeen(contact.lastSeen)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactList;
