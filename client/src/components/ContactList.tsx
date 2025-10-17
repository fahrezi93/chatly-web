import React, { useState, useEffect } from 'react';
import Avatar from './Avatar';
import { User } from '../types';
import { getUnreadCount } from '../utils/notification';

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
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Kontak</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">
            Tidak ada kontak
          </div>
        ) : (
          filteredContacts.map((contact) => {
            const unreadCount = unreadCounts[contact._id] || 0;
            
            return (
              <div
                key={contact._id}
                onClick={() => onSelectContact(contact._id)}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors duration-200 hover:bg-gray-700 ${
                  selectedUserId === contact._id ? 'bg-gray-700' : ''
                }`}
              >
                <Avatar username={contact.username} isOnline={contact.isOnline} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium truncate">{contact.username}</p>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    {contact.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ContactList;
