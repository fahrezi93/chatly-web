import React, { useState, useEffect } from 'react';
import Avatar from './Avatar';
import { User } from '../types';
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
}

const ContactList: React.FC<ContactListProps> = ({ 
  contacts, 
  selectedUserId, 
  onSelectContact,
  currentUserId 
}) => {
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
  
  // Filter out current user from contacts
  const filteredContacts = contacts.filter(contact => contact._id !== currentUserId);
  
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
              
              return (
                <div
                  key={contact._id}
                  onClick={() => onSelectContact(contact._id)}
                  className={`px-3 md:px-4 py-2.5 md:py-3 mx-1 md:mx-2 mb-1 flex items-center gap-2 md:gap-3 cursor-pointer transition-all duration-200 rounded-lg ${
                    selectedUserId === contact._id 
                      ? 'bg-[#2563EB]/10 border-l-4 border-[#2563EB]' 
                      : 'hover:bg-[#64748B]/5'
                  }`}
                >
                  <Avatar username={contact.username} isOnline={contact.isOnline} />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between mb-0.5 gap-2">
                      <p className={`font-semibold truncate text-sm flex-1 min-w-0 ${
                        selectedUserId === contact._id ? 'text-[#2563EB]' : 'text-[#1E293B]'
                      }`}>
                        {contact.username}
                      </p>
                      {unreadCount > 0 && (
                        <span className="bg-[#2563EB] text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center flex-shrink-0 shadow-sm">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs flex items-center gap-1 truncate ${
                      contact.isOnline ? 'text-[#10B981]' : 'text-[#64748B]'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        contact.isOnline ? 'bg-[#10B981]' : 'bg-[#64748B]'
                      }`}></span>
                      {contact.isOnline ? 'Online' : formatLastSeen(contact.lastSeen)}
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
