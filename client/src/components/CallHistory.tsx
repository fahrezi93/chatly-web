import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Avatar from './Avatar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface CallHistoryItem {
  _id: string;
  callerId: string;
  receiverId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: 'completed' | 'missed' | 'rejected' | 'no-answer';
  callType: 'voice' | 'video';
  createdAt: string;
  caller: {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
    isVerified?: boolean;
  };
  receiver: {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
    isVerified?: boolean;
  };
  isIncoming: boolean;
}

interface CallHistoryProps {
  currentUserId: string;
  onClose: () => void;
}

const CallHistory: React.FC<CallHistoryProps> = ({ currentUserId, onClose }) => {
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCallHistory();
  }, [currentUserId]);

  const loadCallHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/call-history/${currentUserId}`);
      setCallHistory(response.data);
    } catch (error) {
      // Error loading call history
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Kemarin ' + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } else if (days < 7) {
      return date.toLocaleDateString('id-ID', { weekday: 'long', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    }
  };

  const getCallIcon = (item: CallHistoryItem) => {
    const isIncoming = item.isIncoming;
    const isMissed = item.status === 'missed' || item.status === 'no-answer' || item.status === 'rejected';
    
    if (isMissed) {
      return (
        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
        </svg>
      );
    }

    if (isIncoming) {
      return (
        <svg className="w-4 h-4 text-emerald-600 transform rotate-135" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-primary-600 transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      );
    }
  };

  const getStatusText = (item: CallHistoryItem) => {
    if (item.status === 'completed' && item.duration) {
      return formatDuration(item.duration);
    }
    if (item.status === 'missed') return 'Tidak terjawab';
    if (item.status === 'rejected') return 'Ditolak';
    if (item.status === 'no-answer') return 'Tidak ada jawaban';
    return '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-large">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Call History</h2>
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
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center text-neutral-400 py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-sm">Loading history...</p>
            </div>
          ) : callHistory.length === 0 ? (
            <div className="text-center text-neutral-400 py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <p className="text-sm">No call history yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {callHistory.map((item) => {
                const otherUser = item.isIncoming ? item.caller : item.receiver;
                const isMissed = item.status === 'missed' || item.status === 'no-answer' || item.status === 'rejected';
                
                return (
                  <div
                    key={item._id}
                    className={`flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-all duration-200 ${
                      isMissed ? 'bg-red-50' : ''
                    }`}
                  >
                    <Avatar username={otherUser.username} size="md" profilePicture={otherUser.profilePicture} isVerified={otherUser.isVerified} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getCallIcon(item)}
                        <span className={`font-medium text-sm truncate ${isMissed ? 'text-red-600' : 'text-neutral-900'}`}>
                          {otherUser.username}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {getStatusText(item)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-neutral-500">
                        {formatDate(item.createdAt)}
                      </p>
                      {item.callType === 'video' && (
                        <span className="text-xs text-primary-600 mt-1 block">Video</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallHistory;
