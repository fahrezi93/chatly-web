import React, { useState, useRef, useEffect } from 'react';
import { Smile, Plus } from 'lucide-react';

export interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
  currentUserId: string;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  showAddButton?: boolean;
  isOwnMessage?: boolean; // For smart positioning
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
  showAddButton = true,
  isOwnMessage = false
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickReactions, setShowQuickReactions] = useState(false);
  const [popupPosition, setPopupPosition] = useState<'top' | 'bottom'>('top');
  const pickerRef = useRef<HTMLDivElement>(null);
  const quickReactionsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (quickReactionsRef.current && !quickReactionsRef.current.contains(event.target as Node)) {
        setShowQuickReactions(false);
      }
    };

    const handleWindowBlur = () => {
      // Close all popups when window loses focus
      setShowEmojiPicker(false);
      setShowQuickReactions(false);
    };

    const handleVisibilityChange = () => {
      // Close all popups when tab becomes hidden
      if (document.hidden) {
        setShowEmojiPicker(false);
        setShowQuickReactions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleReactionClick = (emoji: string) => {
    const existingReaction = reactions.find(r => r.emoji === emoji);
    const userAlreadyReacted = existingReaction?.users.includes(currentUserId);

    if (userAlreadyReacted) {
      // User already reacted with this emoji, remove it
      onRemoveReaction(messageId, emoji);
    } else {
      // User hasn't reacted with this emoji yet, add it
      onAddReaction(messageId, emoji);
    }
    
    // Close popups after reacting
    setShowQuickReactions(false);
    setShowEmojiPicker(false);
  };

  const handleQuickReaction = (emoji: string) => {
    handleReactionClick(emoji);
    // Popup closing is handled in handleReactionClick
  };

  // Smart positioning logic
  const calculatePopupPosition = () => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const spaceAbove = rect.top;
    const spaceBelow = windowHeight - rect.bottom;
    
    // If there's more space above and we're in the bottom half, show popup above
    // Otherwise show below
    if (spaceAbove > spaceBelow && rect.top > windowHeight / 2) {
      setPopupPosition('bottom'); // popup goes above button
    } else {
      setPopupPosition('top'); // popup goes below button
    }
  };

  const handleShowQuickReactions = () => {
    if (showQuickReactions) {
      // If already open, close it
      setShowQuickReactions(false);
    } else {
      // If closed, close other popup first, then calculate position and open
      setShowEmojiPicker(false);
      calculatePopupPosition();
      setShowQuickReactions(true);
    }
  };

  // Filter out reactions with 0 count
  const activeReactions = reactions.filter(r => r.count > 0);

  if (activeReactions.length === 0 && !showAddButton) {
    return null;
  }

  return (
    <div className="relative">
      {/* Existing Reactions */}
      {activeReactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {activeReactions.map((reaction) => {
            const userHasReacted = reaction.users.includes(currentUserId);
            
            return (
              <button
                key={reaction.emoji}
                onClick={() => handleReactionClick(reaction.emoji)}
                className={`flex items-center px-2 py-1 rounded-full text-xs transition-all duration-200 animate-pop hover:scale-110 ${
                  userHasReacted
                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                    : 'bg-gray-700/50 border border-gray-600/30 text-gray-300 hover:bg-gray-600/50'
                }`}
                title={`${reaction.users.length} orang bereaksi dengan ${reaction.emoji}`}
              >
                <span className="mr-1">{reaction.emoji}</span>
                <span className="font-medium">{reaction.count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Add Reaction Button */}
      {showAddButton && (
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={handleShowQuickReactions}
            className="flex items-center justify-center w-6 h-6 rounded-full bg-white/90 border border-gray-300 text-gray-600 hover:bg-white hover:text-gray-800 hover:border-gray-400 transition-all duration-200 shadow-sm"
            title="Tambah reaksi"
          >
            <Smile className="w-3 h-3" />
          </button>

          {/* Quick Reactions Popup */}
          {showQuickReactions && (
            <div
              ref={quickReactionsRef}
              className={`absolute mb-2 bg-white border border-gray-200 rounded-lg p-2 shadow-lg z-20 animate-scale-in ${
                popupPosition === 'top' 
                  ? (isOwnMessage ? 'top-full right-0 mt-2' : 'top-full left-0 mt-2')
                  : (isOwnMessage ? 'bottom-full right-0 mb-2' : 'bottom-full left-0 mb-2')
              }`}
            >
              <div className="flex gap-1">
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleQuickReaction(emoji)}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-all hover:scale-125 text-lg"
                    title={`Reaksi dengan ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setShowQuickReactions(false);
                    calculatePopupPosition();
                    setShowEmojiPicker(true);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-gray-500"
                  title="Pilih emoji lain"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Extended Emoji Picker */}
          {showEmojiPicker && (
            <div
              ref={pickerRef}
              className={`absolute bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-20 max-w-xs animate-scale-in ${
                popupPosition === 'top' 
                  ? (isOwnMessage ? 'top-full right-0 mt-2' : 'top-full left-0 mt-2')
                  : (isOwnMessage ? 'bottom-full right-0 mb-2' : 'bottom-full left-0 mb-2')
              }`}
            >
              <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                {[
                  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
                  '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
                  '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
                  '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
                  '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
                  '😔', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩',
                  '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯',
                  '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓',
                  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
                  '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️',
                  '🖖', '👋', '🤏', '💪', '🦾', '🖕', '✍️', '🙏',
                  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍'
                ].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      handleReactionClick(emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-sm"
                    title={`Reaksi dengan ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageReactions;
