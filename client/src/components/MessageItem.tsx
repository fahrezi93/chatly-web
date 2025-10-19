import { useState, useRef, useEffect, forwardRef } from 'react';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  currentUserId: string;
  onReply: (message: Message) => void;
  onDelete: (messageId: string, deleteForEveryone: boolean) => void;
  onPin?: (messageId: string) => void;
  showSenderName?: boolean; // For group chats
}

const API_URL = 'http://localhost:5000';

const MessageItem = forwardRef<HTMLDivElement, MessageItemProps>(({
  message,
  isOwnMessage,
  currentUserId,
  onReply,
  onDelete,
  onPin,
  showSenderName = false
}, ref) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('bottom');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isMessageActive, setIsMessageActive] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        // Ketika menu ditutup di mobile, tutup juga active state
        if (window.innerWidth < 768) {
          setIsMessageActive(false);
        }
      }
      
      // Close active state on mobile when clicking outside message (but not on menu)
      if (messageRef.current && !messageRef.current.contains(event.target as Node) &&
          (!menuRef.current || !menuRef.current.contains(event.target as Node))) {
        setIsMessageActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detect menu position based on message location
  const handleMenuToggle = () => {
    if (!messageRef.current) {
      setShowMenu(!showMenu);
      return;
    }

    const rect = messageRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const spaceBelow = windowHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Jika space di bawah kurang dari 200px, buka ke atas
    if (spaceBelow < 200 && spaceAbove > spaceBelow) {
      setMenuPosition('top');
    } else {
      setMenuPosition('bottom');
    }

    const newShowMenu = !showMenu;
    setShowMenu(newShowMenu);
    
    // Di mobile, maintain active state ketika menu dibuka
    if (window.innerWidth < 768 && newShowMenu) {
      setIsMessageActive(true);
    }
  };

  // Handle copy message
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopySuccess(true);
      setShowMenu(false);
      
      // Reset copy success after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      // Failed to copy
    }
  };

  // Handle pin message
  const handlePin = () => {
    if (onPin) {
      onPin(message._id || message.id || '');
    }
    setShowMenu(false);
  };

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
      <div className={`mb-2 px-3 py-2 rounded-lg border-l-4 overflow-hidden ${
        isOwnMessage 
          ? 'bg-white/20 border-white/40' 
          : 'bg-neutral-100 border-neutral-300'
      }`}>
        <p className={`text-xs font-medium ${isOwnMessage ? 'text-white/90' : 'text-neutral-700'} truncate`}>
          Membalas ke
        </p>
        <p className={`text-xs ${isOwnMessage ? 'text-white/70' : 'text-neutral-600'} truncate overflow-hidden`}>
          {replyMsg.content}
        </p>
      </div>
    );
  };

  // Handle message click on mobile
  const handleMessageClick = () => {
    // Toggle active state on mobile
    if (window.innerWidth < 768) {
      setIsMessageActive(!isMessageActive);
    }
  };

  return (
    <div 
      ref={ref}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group relative transition-all duration-300 rounded-2xl`}
    >
      <div ref={messageRef} className="relative max-w-[85%] sm:max-w-[75%] lg:max-w-md">
        
        <div
          onClick={handleMessageClick}
          className={`rounded-2xl overflow-hidden ${
            message.isPinned ? 'ring-2 ring-amber-400' : ''
          } ${
            isOwnMessage
              ? 'bg-primary-500 text-white'
              : 'bg-white text-neutral-900 shadow-soft border border-neutral-100'
          }`}
        >
          {/* Sender name for group chats (only show for others' messages) */}
          {showSenderName && !isOwnMessage && (
            <div className="px-3 md:px-4 pt-2 pb-1">
              <p className="text-xs font-semibold text-primary-600">
                {typeof message.senderId === 'object' && message.senderId && 'username' in message.senderId
                  ? message.senderId.username 
                  : 'Pengguna'}
              </p>
            </div>
          )}
          
          {renderReplyPreview()}
          
          {/* Image message */}
          {message.messageType === 'image' && message.fileUrl && (
            <div>
              <img 
                src={`${API_URL}${message.fileUrl}`}
                alt={message.fileName || 'Image'} 
                className="max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(`${API_URL}${message.fileUrl}`, '_blank')}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                crossOrigin="anonymous"
              />
              <div className="px-3 md:px-4 py-2">
                <p className={`text-sm ${isOwnMessage ? 'text-white/90' : 'text-neutral-600'}`}>
                  {message.content}
                </p>
              </div>
            </div>
          )}
          
          {/* File message */}
          {message.messageType === 'file' && message.fileUrl && (
            <div className="px-3 md:px-4 py-2 md:py-3">
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
            <div className="px-3 md:px-4 py-2 md:py-2.5">
              <p className="break-words whitespace-pre-wrap overflow-wrap-anywhere text-sm leading-relaxed">{message.content}</p>
            </div>
          )}
          
          {/* Time and status */}
          <div className="flex items-center gap-1 px-3 md:px-4 pb-2">
            <p className={`text-xs ${isOwnMessage ? 'text-white/70' : 'text-neutral-400'}`}>
              {new Date(message.createdAt).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            {isOwnMessage && (
              <span 
                className={`text-xs ml-1 ${
                  message.isRead || message.status === 'read' 
                    ? 'text-blue-400' 
                    : 'text-white/70'
                }`}
                title={
                  message.isRead || message.status === 'read'
                    ? `Dibaca ${new Date(message.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}`
                    : 'Terkirim'
                }
              >
                {message.isRead || message.status === 'read' ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>

        {/* Message menu - Hanya tampil saat hover di desktop atau tap di mobile */}
        <div className={`absolute ${isOwnMessage ? 'right-full mr-2' : 'left-full ml-2'} top-1/2 -translate-y-1/2 z-50`}>
          <button
            onClick={handleMenuToggle}
            className={`p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all ${
              isMessageActive || showMenu ? 'opacity-100' : 'opacity-0 md:opacity-0 md:group-hover:opacity-100'
            }`}
            aria-label="Message options"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div
              ref={menuRef}
              className={`absolute ${isOwnMessage ? 'right-full mr-1 md:mr-2' : 'left-full ml-1 md:ml-2'} ${menuPosition === 'top' ? 'bottom-0' : 'top-0'} w-44 md:w-48 bg-white rounded-lg shadow-large border border-neutral-100 py-1 z-[200]`}
            >
              {/* Reply */}
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

              {/* Copy */}
              <button
                onClick={handleCopy}
                className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copySuccess ? 'Tersalin!' : 'Salin'}
              </button>

              {/* Pin/Favorite */}
              <button
                onClick={handlePin}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                  message.isPinned 
                    ? 'text-amber-600 hover:bg-amber-50' 
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <svg className="w-4 h-4" fill={message.isPinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {message.isPinned ? 'Unpin Pesan' : 'Pin Pesan'}
              </button>

              {/* Delete - Show different options based on ownership */}
              {isOwnMessage ? (
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
              ) : (
                <button
                  onClick={() => {
                    onDelete(message._id || message.id || '', false);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Hapus untuk Saya
                </button>
              )}
            </div>
          )}
        </div>

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
});

MessageItem.displayName = 'MessageItem';

export default MessageItem;
