import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  currentUserId: string;
  onReply: (message: Message) => void;
  onDelete: (messageId: string, deleteForEveryone: boolean) => void;
}

const API_URL = 'http://localhost:5000';

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwnMessage,
  currentUserId,
  onReply,
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if message is deleted
  const isDeletedForEveryone = message.deletedForEveryone === true;
  const isDeletedForMe = Array.isArray(message.deletedFor) && message.deletedFor.includes(currentUserId);
  const isDeleted = isDeletedForEveryone || isDeletedForMe;

  if (isDeleted) {
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-neutral-100 text-neutral-400 italic text-sm">
          <p>Pesan ini telah dihapus</p>
        </div>
      </div>
    );
  }

  const renderReplyPreview = () => {
    if (!message.replyTo) return null;
    
    const replyMsg = typeof message.replyTo === 'string' ? null : message.replyTo;
    if (!replyMsg) return null;

    return (
      <div className={`mb-2 px-3 py-2 rounded-lg border-l-4 ${
        isOwnMessage 
          ? 'bg-white/20 border-white/40' 
          : 'bg-neutral-100 border-neutral-300'
      }`}>
        <p className={`text-xs font-medium ${isOwnMessage ? 'text-white/90' : 'text-neutral-700'}`}>
          Membalas ke
        </p>
        <p className={`text-xs ${isOwnMessage ? 'text-white/70' : 'text-neutral-600'} truncate`}>
          {replyMsg.content}
        </p>
      </div>
    );
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}>
      <div className="relative max-w-xs lg:max-w-md">
        <div
          className={`rounded-2xl overflow-hidden ${
            isOwnMessage
              ? 'bg-primary-500 text-white'
              : 'bg-white text-neutral-900 shadow-soft border border-neutral-100'
          }`}
        >
          {renderReplyPreview()}
          
          {/* Image message */}
          {message.messageType === 'image' && message.fileUrl && (
            <div>
              <img 
                src={`${API_URL}${message.fileUrl}`}
                alt={message.fileName || 'Image'} 
                className="max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(`${API_URL}${message.fileUrl}`, '_blank')}
              />
              <div className="px-4 py-2">
                <p className={`text-sm ${isOwnMessage ? 'text-white/90' : 'text-neutral-600'}`}>
                  {message.content}
                </p>
              </div>
            </div>
          )}
          
          {/* File message */}
          {message.messageType === 'file' && message.fileUrl && (
            <div className="px-4 py-3">
              <a 
                href={`${API_URL}${message.fileUrl}`}
                download={message.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className={`p-2 rounded-lg ${
                  isOwnMessage ? 'bg-white/20' : 'bg-neutral-100'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{message.fileName}</p>
                  <p className={`text-xs ${isOwnMessage ? 'text-white/70' : 'text-neutral-500'}`}>
                    {message.content}
                  </p>
                </div>
              </a>
            </div>
          )}
          
          {/* Text message */}
          {(!message.messageType || message.messageType === 'text') && (
            <div className="px-4 py-2.5">
              <p className="break-words text-sm leading-relaxed">{message.content}</p>
            </div>
          )}
          
          {/* Time and status */}
          <div className="flex items-center gap-1 px-4 pb-2">
            <p className={`text-xs ${isOwnMessage ? 'text-white/70' : 'text-neutral-400'}`}>
              {new Date(message.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            {isOwnMessage && (
              <span className="text-xs text-white/70 ml-1">
                {message.isRead || message.status === 'read' ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>

        {/* Message menu - Posisi: kiri untuk pesan sendiri, kanan untuk pesan orang */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`absolute ${isOwnMessage ? '-left-8' : '-right-8'} top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white shadow-soft border border-neutral-200 text-neutral-600 hover:text-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {showMenu && (
          <div
            ref={menuRef}
            className={`absolute ${isOwnMessage ? 'left-0' : 'right-0'} mt-1 w-48 bg-white rounded-lg shadow-large border border-neutral-100 py-1 z-50`}
          >
            <button
              onClick={() => {
                onReply(message);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Balas
            </button>

            {isOwnMessage && (
              <button
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus
              </button>
            )}
          </div>
        )}

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-large">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Hapus Pesan?</h3>
              <p className="text-sm text-neutral-600 mb-6">
                Pilih untuk siapa Anda ingin menghapus pesan ini.
              </p>
              
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onDelete(message._id || message.id || '', false);
                    setShowDeleteConfirm(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  Hapus untuk saya
                </button>
                <button
                  onClick={() => {
                    onDelete(message._id || message.id || '', true);
                    setShowDeleteConfirm(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  Hapus untuk semua orang
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
