import React from 'react';
import Avatar from './Avatar';
import { User } from '../types';

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
  // Filter out current user from contacts
  const filteredContacts = contacts.filter(contact => contact._id !== currentUserId);

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
          filteredContacts.map((contact) => (
            <div
              key={contact._id}
              onClick={() => onSelectContact(contact._id)}
              className={`p-4 flex items-center gap-3 cursor-pointer transition-colors duration-200 hover:bg-gray-700 ${
                selectedUserId === contact._id ? 'bg-gray-700' : ''
              }`}
            >
              <Avatar username={contact.username} isOnline={contact.isOnline} />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{contact.username}</p>
                <p className="text-sm text-gray-400">
                  {contact.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContactList;
