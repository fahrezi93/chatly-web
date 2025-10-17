import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import Button from './Button';

interface VoiceCallModalProps {
  isOpen: boolean;
  isCaller: boolean;
  recipientName: string;
  recipientId: string;
  currentUserId: string;
  socket: Socket | null;
  onClose: () => void;
}

const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  isOpen,
  isCaller,
  recipientName,
  recipientId,
  currentUserId,
  socket,
  onClose
}) => {
  const [callStatus, setCallStatus] = useState<'calling' | 'connected' | 'ended'>('calling');
  const [isMuted, setIsMuted] = useState(false);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Initialize WebRTC
  useEffect(() => {
    if (!isOpen || !socket) return;

    const initCall = async () => {
      try {
        // Get user media (audio only)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStreamRef.current = stream;

        // Create peer connection
        const peerConnection = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        });
        peerConnectionRef.current = peerConnection;

        // Add local stream tracks to peer connection
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });

        // Handle incoming tracks
        peerConnection.ontrack = (event) => {
          if (remoteAudioRef.current && event.streams[0]) {
            remoteAudioRef.current.srcObject = event.streams[0];
            setCallStatus('connected');
          }
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('ice-candidate', {
              targetUserId: recipientId,
              candidate: event.candidate
            });
          }
        };

        // If caller, create offer
        if (isCaller) {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          
          socket.emit('call-user', {
            callerId: currentUserId,
            receiverId: recipientId,
            offer: offer
          });
        }
      } catch (error) {
        console.error('Error initializing call:', error);
        alert('Tidak dapat mengakses mikrofon. Pastikan izin diberikan.');
        onClose();
      }
    };

    initCall();

    // Socket event listeners
    const handleIncomingCall = async (data: { callerId: string; offer: RTCSessionDescriptionInit }) => {
      if (!peerConnectionRef.current) return;
      
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        
        socket.emit('answer-call', {
          callerId: data.callerId,
          answer: answer
        });
      } catch (error) {
        console.error('Error handling incoming call:', error);
      }
    };

    const handleCallAnswered = async (data: { answer: RTCSessionDescriptionInit }) => {
      if (!peerConnectionRef.current) return;
      
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      } catch (error) {
        console.error('Error handling call answer:', error);
      }
    };

    const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit }) => {
      if (!peerConnectionRef.current) return;
      
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    };

    const handleCallEnded = () => {
      setCallStatus('ended');
      setTimeout(() => {
        onClose();
      }, 1000);
    };

    const handleCallRejected = () => {
      alert('Panggilan ditolak');
      onClose();
    };

    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-answered', handleCallAnswered);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('call-ended', handleCallEnded);
    socket.on('call-rejected', handleCallRejected);

    return () => {
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-answered', handleCallAnswered);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('call-ended', handleCallEnded);
      socket.off('call-rejected', handleCallRejected);
    };
  }, [isOpen, isCaller, recipientId, currentUserId, socket, onClose]);

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

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
      socket.emit('end-call', { targetUserId: recipientId });
    }
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    onClose();
  };

  const handleRejectCall = () => {
    if (socket) {
      socket.emit('reject-call', { callerId: recipientId });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 w-96 text-center">
        <div className="mb-6">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
            {recipientName.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{recipientName}</h2>
          <p className="text-gray-400">
            {callStatus === 'calling' && (isCaller ? 'Memanggil...' : 'Panggilan masuk...')}
            {callStatus === 'connected' && 'Terhubung'}
            {callStatus === 'ended' && 'Panggilan berakhir'}
          </p>
        </div>

        <audio ref={remoteAudioRef} autoPlay />

        <div className="flex gap-4 justify-center">
          {callStatus === 'calling' && !isCaller && (
            <>
              <Button 
                onClick={handleRejectCall}
                variant="danger"
                className="rounded-full w-16 h-16 flex items-center justify-center"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
              <Button 
                onClick={() => setCallStatus('connected')}
                className="rounded-full w-16 h-16 flex items-center justify-center bg-green-600 hover:bg-green-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </Button>
            </>
          )}

          {(callStatus === 'connected' || (callStatus === 'calling' && isCaller)) && (
            <>
              <Button
                onClick={handleToggleMute}
                variant="secondary"
                className="rounded-full w-16 h-16 flex items-center justify-center"
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
              </Button>
              <Button
                onClick={handleEndCall}
                variant="danger"
                className="rounded-full w-16 h-16 flex items-center justify-center"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceCallModal;
