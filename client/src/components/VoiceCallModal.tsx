import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import Modal from './Modal';

interface VoiceCallModalProps {
  isOpen: boolean;
  isCaller: boolean;
  recipientName: string;
  recipientId: string;
  currentUserId: string;
  socket: Socket | null;
  incomingOffer?: RTCSessionDescriptionInit | null;
  callId?: string | null;
  onClose: () => void;
}

const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  isOpen,
  isCaller,
  recipientName,
  recipientId,
  currentUserId,
  socket,
  incomingOffer,
  callId,
  onClose
}) => {
  const [callStatus, setCallStatus] = useState<'calling' | 'connected' | 'ended'>('calling');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    onConfirm: () => {}
  });
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const iceCandidatesQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const hasProcessedOfferRef = useRef(false);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const connectionStartTimeRef = useRef<number | null>(null);
  const callIdRef = useRef<string | null>(null);

  // Initialize WebRTC
  useEffect(() => {
    if (!isOpen || !socket) return;
    
    // Reset offer processed flag when modal opens
    hasProcessedOfferRef.current = false;
    
    // Store callId from props
    if (callId) {
      callIdRef.current = callId;
      console.log('📝 Stored callId:', callId);
    }

    const initCall = async () => {
      try {
        console.log('🎙️ Initializing call...', { isCaller, currentUserId, recipientId });
        
        // Get user media (audio only)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStreamRef.current = stream;
        console.log('✅ Got local media stream');

        // Create peer connection
        const peerConnection = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        });
        peerConnectionRef.current = peerConnection;
        console.log('✅ Created peer connection');

        // Add local stream tracks to peer connection
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });
        console.log('✅ Added local tracks to peer connection');

        // Handle incoming tracks
        peerConnection.ontrack = (event) => {
          console.log('📥 Received remote track');
          if (remoteAudioRef.current && event.streams[0]) {
            remoteAudioRef.current.srcObject = event.streams[0];
            setCallStatus('connected');
            console.log('✅ Connected! Playing remote audio');
          }
        };

        // Handle ICE connection state changes
        peerConnection.oniceconnectionstatechange = () => {
          console.log('🧊 ICE connection state:', peerConnection.iceConnectionState);
          if (peerConnection.iceConnectionState === 'connected') {
            setCallStatus('connected');
          } else if (peerConnection.iceConnectionState === 'failed' || 
                     peerConnection.iceConnectionState === 'disconnected') {
            console.error('❌ Connection failed or disconnected');
          }
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            console.log('🧊 Sending ICE candidate to:', recipientId);
            socket.emit('ice-candidate', {
              targetUserId: recipientId,
              senderId: currentUserId,
              candidate: event.candidate
            });
          } else {
            console.log('✅ All ICE candidates sent');
          }
        };

        // If caller, create offer
        if (isCaller) {
          console.log('📞 Creating offer to call:', recipientId);
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          
          console.log('📤 Emitting call-user event with offer');
          socket.emit('call-user', {
            callerId: currentUserId,
            receiverId: recipientId,
            offer: offer
          });
        } else {
          console.log('👂 Receiver mode - waiting for user to accept call');
          // Don't process offer automatically - wait for user to click Accept button
        }
      } catch (error) {
        console.error('❌ Error initializing call:', error);
        showNotification(
          'Akses Mikrofon Ditolak',
          'Tidak dapat mengakses mikrofon. Pastikan izin untuk menggunakan mikrofon telah diberikan di pengaturan browser Anda.',
          'error'
        );
      }
    };

    initCall();

    // Socket event listeners
    const handleIncomingCallOffer = async (data: { callerId: string; offer: RTCSessionDescriptionInit }) => {
      console.log('📞 Received incoming call offer from:', data.callerId);
      
      // Prevent processing the same offer twice
      if (hasProcessedOfferRef.current) {
        console.log('⏭️ Offer already processed, skipping');
        return;
      }
      
      // Only handle if we are receiver and offer is from the expected caller
      if (!peerConnectionRef.current) {
        console.error('❌ Peer connection not ready');
        return;
      }
      
      if (isCaller) {
        console.log('⚠️ Ignoring offer - we are the caller');
        return;
      }
      
      if (data.callerId !== recipientId) {
        console.log('⚠️ Ignoring offer - not from expected caller', { expected: recipientId, actual: data.callerId });
        return;
      }
      
      hasProcessedOfferRef.current = true;
      
      try {
        console.log('🤝 Setting remote description from offer');
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        
        console.log('📝 Creating answer');
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        
        console.log('📤 Sending answer back to caller');
        socket.emit('answer-call', {
          callerId: data.callerId,
          receiverId: currentUserId,
          answer: answer
        });
        
        // Process queued ICE candidates
        console.log('🧊 Processing queued ICE candidates:', iceCandidatesQueueRef.current.length);
        for (const candidate of iceCandidatesQueueRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
        iceCandidatesQueueRef.current = [];
        
        console.log('✅ Answer sent successfully');
      } catch (error) {
        console.error('❌ Error handling offer:', error);
        hasProcessedOfferRef.current = false; // Reset on error
      }
    };

    const handleCallAnswered = async (data: { receiverId: string; answer: RTCSessionDescriptionInit }) => {
      console.log('📞 Call answered by:', data.receiverId);
      
      if (!peerConnectionRef.current) {
        console.error('❌ Peer connection not ready');
        return;
      }
      
      try {
        console.log('🤝 Setting remote description from answer');
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        
        // Process queued ICE candidates
        console.log('🧊 Processing queued ICE candidates:', iceCandidatesQueueRef.current.length);
        for (const candidate of iceCandidatesQueueRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
        iceCandidatesQueueRef.current = [];
        
        console.log('✅ Remote description set, waiting for connection...');
      } catch (error) {
        console.error('❌ Error handling call answer:', error);
      }
    };

    const handleIceCandidate = async (data: { senderId: string; candidate: RTCIceCandidateInit }) => {
      console.log('🧊 Received ICE candidate from:', data.senderId);
      
      if (!peerConnectionRef.current) {
        console.error('❌ Peer connection not ready');
        return;
      }
      
      try {
        // Check if remote description is set
        if (peerConnectionRef.current.remoteDescription) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          console.log('✅ ICE candidate added');
        } else {
          // Queue the candidate until remote description is set
          console.log('⏳ Queueing ICE candidate (remote description not set yet)');
          iceCandidatesQueueRef.current.push(data.candidate);
        }
      } catch (error) {
        console.error('❌ Error handling ICE candidate:', error);
      }
    };

    const handleCallEnded = () => {
      console.log('📴 Call ended');
      setCallStatus('ended');
      setTimeout(() => {
        onClose();
      }, 1000);
    };

    const handleCallRejected = () => {
      console.log('❌ Call rejected');
      showNotification(
        'Panggilan Ditolak',
        `${recipientName} menolak panggilan Anda.`,
        'warning'
      );
    };

    const handleCallFailed = (data: { message: string }) => {
      console.log('❌ Call failed:', data.message);
      showNotification(
        'Panggilan Gagal',
        data.message,
        'error'
      );
    };

    // Setup socket listeners
    if (!isCaller) {
      socket.on('incoming-call', handleIncomingCallOffer);
    }
    socket.on('call-answered', handleCallAnswered);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('call-ended', handleCallEnded);
    socket.on('call-rejected', handleCallRejected);
    socket.on('call-failed', handleCallFailed);

    return () => {
      console.log('🧹 Cleaning up socket listeners');
      if (!isCaller) {
        socket.off('incoming-call', handleIncomingCallOffer);
      }
      socket.off('call-answered', handleCallAnswered);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('call-ended', handleCallEnded);
      socket.off('call-rejected', handleCallRejected);
      socket.off('call-failed', handleCallFailed);
    };
  }, [isOpen, isCaller, recipientId, currentUserId, socket, onClose]);

  // Timer for call duration
  useEffect(() => {
    if (callStatus === 'connected' && !callTimerRef.current) {
      connectionStartTimeRef.current = Date.now();
      
      callTimerRef.current = setInterval(() => {
        if (connectionStartTimeRef.current) {
          const elapsed = Math.floor((Date.now() - connectionStartTimeRef.current) / 1000);
          setCallDuration(elapsed);
        }
      }, 1000);
      
      console.log('⏱️ Call timer started');
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
        console.log('⏱️ Call timer stopped');
      }
    };
  }, [callStatus]);

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const showNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setModalConfig({
      title,
      message,
      type,
      onConfirm: () => {
        setShowModal(false);
        if (type === 'error') {
          onClose();
        }
      }
    });
    setShowModal(true);
  };

  const handleToggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const handleEndCall = () => {
    if (socket) {
      socket.emit('end-call', { 
        targetUserId: recipientId,
        callId: callIdRef.current,
        duration: callDuration
      });
    }
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    onClose();
  };

  const handleAcceptCall = async () => {
    if (!peerConnectionRef.current || !incomingOffer || hasProcessedOfferRef.current) {
      console.error('❌ Cannot accept call - invalid state');
      return;
    }

    console.log('✅ User accepted call - processing offer');
    setIsCallAccepted(true);
    hasProcessedOfferRef.current = true;

    try {
      console.log('📦 Processing incoming offer after user acceptance');
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(incomingOffer));
      console.log('✅ Remote description set from stored offer');
      
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      console.log('✅ Local description (answer) set');
      
      console.log('📤 Sending answer to caller');
      socket?.emit('answer-call', {
        callerId: recipientId,
        receiverId: currentUserId,
        answer: answer,
        callId: callIdRef.current
      });
      
      // Process queued ICE candidates
      console.log('🧊 Processing queued ICE candidates:', iceCandidatesQueueRef.current.length);
      for (const candidate of iceCandidatesQueueRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
      iceCandidatesQueueRef.current = [];
      
      console.log('✅ Answer sent successfully');
    } catch (error) {
      console.error('❌ Error processing offer after acceptance:', error);
      hasProcessedOfferRef.current = false;
      setIsCallAccepted(false);
    }
  };

  const handleRejectCall = () => {
    if (socket) {
      socket.emit('reject-call', { 
        callerId: recipientId,
        callId: callIdRef.current
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-10 w-full max-w-md text-center shadow-large">
        <div className="mb-8">
          <div className="w-28 h-28 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-4xl font-semibold mx-auto mb-6 shadow-medium">
            {recipientName.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">{recipientName}</h2>
          <p className="text-neutral-500">
            {callStatus === 'calling' && (isCaller ? 'Calling...' : 'Incoming call...')}
            {callStatus === 'connected' && (
              <span className="text-emerald-600 font-mono text-xl font-medium">{formatDuration(callDuration)}</span>
            )}
            {callStatus === 'ended' && 'Call ended'}
          </p>
        </div>

        <audio ref={remoteAudioRef} autoPlay />

        <div className="flex gap-4 justify-center">
          {callStatus === 'calling' && !isCaller && !isCallAccepted && (
            <>
              <button 
                onClick={handleRejectCall}
                className="rounded-full w-16 h-16 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-soft"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button 
                onClick={handleAcceptCall}
                className="rounded-full w-16 h-16 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200 shadow-soft"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            </>
          )}
          
          {callStatus === 'calling' && !isCaller && isCallAccepted && (
            <div className="text-neutral-400 animate-pulse text-sm">Connecting...</div>
          )}

          {(callStatus === 'connected' || (callStatus === 'calling' && isCaller)) && (
            <>
              <button
                onClick={handleToggleMute}
                className="rounded-full w-16 h-16 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-all duration-200 shadow-soft"
              >
                {isMuted ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleEndCall}
                className="rounded-full w-16 h-16 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-soft"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notification Modal */}
      <Modal
        isOpen={showModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        confirmText="OK"
      />
    </div>
  );
};

export default VoiceCallModal;
