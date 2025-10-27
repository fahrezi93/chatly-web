import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Avatar from './Avatar';
import { User } from '../types';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactAdded: (user: User) => void;
  currentUserId: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AddContactModal: React.FC<AddContactModalProps> = ({ 
  isOpen, 
  onClose, 
  onContactAdded,
  currentUserId 
}) => {
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchUsername.trim().length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const cleanUsername = searchUsername.trim().replace('@', '').toLowerCase();
        const response = await axios.get(`${API_URL}/api/users`);
        
        // Filter users by username match
        const filtered = response.data
          .filter((user: User) => 
            user._id !== currentUserId && 
            user.username.toLowerCase().includes(cleanUsername)
          )
          .slice(0, 5); // Limit to 5 results
        
        setSearchResults(filtered);
        setShowSuggestions(filtered.length > 0);
        setError('');
      } catch (err) {
        setError('Terjadi kesalahan saat mencari');
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchUsername, currentUserId]);

  const handleSelectUser = (user: User) => {
    onContactAdded(user);
    handleClose();
  };

  const handleClose = () => {
    setSearchUsername('');
    setSearchResults([]);
    setError('');
    setShowSuggestions(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    onClose();
  };

  // Early return after all hooks
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-large animate-[fadeIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Tambah Kontak</h2>
          <button
            onClick={handleClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Cari berdasarkan Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 z-10">@</span>
              <input
                type="text"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                placeholder="Ketik minimal 2 karakter..."
                className="w-full pl-8 pr-4 py-3 bg-white border border-neutral-300 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-neutral-400 text-sm"
                autoFocus
              />
              {loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin h-5 w-5 text-neutral-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Contoh: fahrezi93, john_doe
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Search Results Suggestions */}
          {showSuggestions && searchResults.length > 0 && (
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200">
                <p className="text-xs font-medium text-neutral-600">
                  Ditemukan {searchResults.length} hasil
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleSelectUser(user)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-b-0"
                  >
                    <Avatar username={user.username} isOnline={user.isOnline} size="md" profilePicture={user.profilePicture} isVerified={user.isVerified} />
                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="font-semibold text-neutral-900 truncate text-sm">
                        {user.displayName || user.username}
                      </h3>
                      <p className="text-xs text-neutral-500 truncate">@{user.username}</p>
                      {user.status && (
                        <p className="text-xs text-neutral-400 mt-0.5 italic truncate">"{user.status}"</p>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-neutral-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchUsername.trim().length >= 2 && !loading && searchResults.length === 0 && !error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <svg className="w-12 h-12 text-yellow-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm font-medium text-yellow-700">Tidak ada hasil</p>
              <p className="text-xs text-yellow-600 mt-1">Username tidak ditemukan</p>
            </div>
          )}

          {/* Info Box */}
          {searchUsername.trim().length < 2 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Tips:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Username bersifat unik dan permanen</li>
                    <li>• Gunakan @ atau langsung ketik username</li>
                    <li>• Username hanya huruf kecil, angka, dan _</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddContactModal;
