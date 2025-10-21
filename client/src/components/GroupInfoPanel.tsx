import React, { useState } from 'react';
import { Group, User } from '../types';
import Avatar from './Avatar';

interface GroupInfoPanelProps {
  group: Group;
  currentUserId: string;
  onClose: () => void;
  onLeaveGroup?: () => void;
  onAddMember?: () => void;
}

const GroupInfoPanel: React.FC<GroupInfoPanelProps> = ({
  group,
  currentUserId,
  onClose,
  onLeaveGroup,
  onAddMember
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'media' | 'files'>('members');

  // Check if current user is admin
  const isAdmin = group.admins.some(admin => 
    typeof admin === 'string' ? admin === currentUserId : admin._id === currentUserId
  );

  // Check if current user is creator
  const isCreator = typeof group.creator === 'string' 
    ? group.creator === currentUserId 
    : group.creator._id === currentUserId;

  // Get members as User objects
  const members = group.members.filter(member => typeof member === 'object') as User[];
  const memberCount = Array.isArray(group.members) ? group.members.length : 0;

  return (
    <div className="w-80 bg-white border-l border-neutral-200 flex flex-col h-full overflow-hidden animate-slide-in-right shadow-2xl z-50 fixed right-0 top-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Info Grup</h2>
        <button
          onClick={onClose}
          className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Group Info Section */}
        <div className="px-6 py-6 border-b border-neutral-200">
          <div className="flex flex-col items-center text-center">
            {/* Group Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4">
              {group.name.charAt(0).toUpperCase()}
            </div>
            
            {/* Group Name */}
            <h3 className="text-xl font-bold text-neutral-900 mb-2">{group.name}</h3>
            
            {/* Member Count */}
            <p className="text-sm text-neutral-500 mb-4">
              {memberCount} {memberCount === 1 ? 'anggota' : 'anggota'}
            </p>
            
            {/* Group Description */}
            {group.description && (
              <div className="w-full bg-neutral-50 rounded-lg p-4 mb-4">
                <p className="text-xs font-semibold text-neutral-700 mb-1">Deskripsi Grup</p>
                <p className="text-sm text-neutral-600">{group.description}</p>
              </div>
            )}
            
            {/* Created Date */}
            <p className="text-xs text-neutral-400">
              Dibuat {new Date(group.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 hover:scale-105 ${
              activeTab === 'members'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Anggota
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 hover:scale-105 ${
              activeTab === 'media'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Media
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 hover:scale-105 ${
              activeTab === 'files'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            File
          </button>
        </div>

        {/* Tab Content */}
        <div className="px-6 py-4">
          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-3">
              {/* Add Member Button (only for admins) */}
              {isAdmin && onAddMember && (
                <button
                  onClick={onAddMember}
                  className="w-full flex items-center gap-3 p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] animate-fade-in"
                >
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-primary-700">Tambah Anggota</span>
                </button>
              )}

              {/* Members List */}
              <div className="space-y-2">
                {members.map((member) => {
                  const memberId = member._id;
                  const isMemberAdmin = group.admins.some(admin => 
                    typeof admin === 'string' ? admin === memberId : admin._id === memberId
                  );
                  const isMemberCreator = typeof group.creator === 'string' 
                    ? group.creator === memberId 
                    : group.creator._id === memberId;

                  return (
                    <div
                      key={memberId}
                      className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg transition-all duration-200 hover:scale-[1.01] animate-fade-in"
                    >
                      <Avatar username={member.username} isOnline={member.isOnline} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {member.username}
                            {memberId === currentUserId && (
                              <span className="text-neutral-500 ml-1">(Anda)</span>
                            )}
                          </p>
                          {isMemberCreator && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                              Pembuat
                            </span>
                          )}
                          {isMemberAdmin && !isMemberCreator && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${
                          member.isOnline ? 'text-emerald-600' : 'text-neutral-500'
                        }`}>
                          {member.isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-neutral-500 text-sm">Belum ada media</p>
              <p className="text-neutral-400 text-xs mt-1">Foto dan video yang dibagikan akan muncul di sini</p>
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="text-neutral-500 text-sm">Belum ada file</p>
              <p className="text-neutral-400 text-xs mt-1">Dokumen yang dibagikan akan muncul di sini</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-neutral-200 space-y-2">
        {/* Mute Notifications */}
        <button className="w-full flex items-center gap-3 p-3 text-neutral-700 hover:bg-neutral-50 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
          <span className="text-sm font-medium">Bisukan Notifikasi</span>
        </button>

        {/* Leave Group */}
        {!isCreator && onLeaveGroup && (
          <button
            onClick={onLeaveGroup}
            className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium">Keluar dari Grup</span>
          </button>
        )}

        {/* Delete Group (only for creator) */}
        {isCreator && (
          <button className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="text-sm font-medium">Hapus Grup</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default GroupInfoPanel;
