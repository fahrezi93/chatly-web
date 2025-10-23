import React from 'react';
interface User {
  _id: string;
  username: string;
  isOnline?: boolean;
  description?: string;
}
import Avatar from './Avatar';

interface UserInfoPanelProps {
  user: User | null;
  onClose: () => void;
}

const UserInfoPanel: React.FC<UserInfoPanelProps> = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-gray-200 shadow-lg z-40 transform transition-transform duration-300 ease-in-out">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-bold text-lg">Info Kontak</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-6 text-center">
        <div className="mb-4">
          <Avatar username={user.username} isOnline={user.isOnline} size="xl" />
        </div>
        <h3 className="font-bold text-xl">{user.username}</h3>
        <p className="text-gray-500 text-sm">{user.isOnline ? 'Online' : 'Offline'}</p>
      </div>
      <div className="p-6 border-t border-gray-200">
        <h4 className="font-bold text-md mb-2">Deskripsi</h4>
        <p className="text-gray-600 text-sm">{user.description || 'Tidak ada deskripsi.'}</p>
      </div>
    </div>
  );
};

export default UserInfoPanel;
