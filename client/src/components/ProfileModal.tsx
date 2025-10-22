import React, { useState } from 'react';
import axios from 'axios';
import Avatar from './Avatar';
import Button from './Button';
import Input from './Input';
import { User } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, user, onClose, onUpdate }) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio || '');
  const [status, setStatus] = useState(user.status || '');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(user.profilePicture || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('bio', bio);
      formData.append('status', status);
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const response = await axios.put(
        `${API_URL}/api/users/${user._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      onUpdate(response.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memperbarui profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-xl md:rounded-2xl w-full max-w-full sm:max-w-md shadow-large animate-[fadeIn_0.2s_ease-out] max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-neutral-200">
          <h2 className="text-base md:text-lg font-semibold text-neutral-900">Edit Profil</h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-3 md:space-y-4">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {previewUrl ? (
                <img
                  src={previewUrl.startsWith('blob:') || previewUrl.startsWith('data:') ? previewUrl : `${API_URL}${previewUrl}`}
                  alt="Profile"
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-soft"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                  crossOrigin="anonymous"
                />
              ) : (
                <Avatar username={username} size="lg" />
              )}
              <label
                htmlFor="profilePicture"
                className="absolute bottom-0 right-0 p-2 bg-primary-500 text-white rounded-full cursor-pointer hover:bg-primary-600 transition-all shadow-soft"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-neutral-500 mt-2">Klik untuk ubah foto</p>
          </div>

          {/* Username */}
          <Input
            label="Nama Pengguna"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nama pengguna Anda"
            required
          />

          {/* Email */}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@contoh.com"
            required
          />

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Hai! Saya menggunakan aplikasi chat ini"
              maxLength={100}
              className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-neutral-400 text-sm"
            />
            <p className="text-xs text-neutral-500 mt-1">{status.length}/100 karakter</p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ceritakan tentang diri Anda..."
              maxLength={150}
              rows={3}
              className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-neutral-400 resize-none text-sm"
            />
            <p className="text-xs text-neutral-500 mt-1">{bio.length}/150 karakter</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
