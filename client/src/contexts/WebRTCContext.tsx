import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message, PeerConnection, MediaState, UserPreferences } from '../types';

interface WebRTCContextType {
    messages: Message[];
    mediaState: MediaState;
    onlineUsers: number;
    connectionDuration: number;
    userPreferences: UserPreferences | null;
    socket: Socket | null;
    peerConnection: PeerConnection;
    sendMessage: (text: string) => void;
    toggleAudio: () => void;
    toggleVideo: () => void;
    startConnection: () => void;
    skipConnection: () => void;
    cancelSearch: () => void;
    setUserPreferences: (preferences: UserPreferences) => void;
    sendMatchRequest: (contactType: string, contact: string) => void;
    myVideoRef: React.RefObject<HTMLVideoElement | null>;
    strangerVideoRef: React.RefObject<HTMLVideoElement | null>;
}

const WebRTCContext = createContext<WebRTCContextType | undefined>(undefined);

const SERVER_URL = 'http://localhost:8000';

export const WebRTCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [mediaState, setMediaState] = useState<MediaState>({
        audioEnabled: true,
        videoEnabled: true,
        isConnected: false,
        isSearching: false
    });
    const [onlineUsers, setOnlineUsers] = useState(0);
    const [connectionDuration, setConnectionDuration] = useState(0);
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
    const connectionStartTime = useRef<number | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const peerRef = useRef<PeerConnection>({
        peer: null,
        remoteSocketId: null,
        type: null,
        roomId: null
    });
    const streamRef = useRef<MediaStream | null>(null);
    const myVideoRef = useRef<HTMLVideoElement>(null);
    const strangerVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        socketRef.current = io(SERVER_URL);

        socketRef.current.on('online', (count: number) => {
            setOnlineUsers(count);
        });

        socketRef.current.on('remote-socket', handleRemoteSocket);
        socketRef.current.on('sdp:reply', handleSdpReply);
        socketRef.current.on('ice:reply', handleIceReply);
        socketRef.current.on('roomid', (id: string) => {
            peerRef.current.roomId = id;
        });
        socketRef.current.on('get-message', handleGetMessage);
        socketRef.current.on('disconnected', handleDisconnect);

        return () => {
            cleanup();
            socketRef.current?.disconnect();
        };
    }, []);

    const startMediaCapture = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
            });

            streamRef.current = stream;

            if (myVideoRef.current) {
                myVideoRef.current.srcObject = stream;
            }

            if (peerRef.current.peer) {
                stream.getTracks().forEach(track => {
                    peerRef.current.peer?.addTrack(track, stream);
                });

                peerRef.current.peer.ontrack = (e) => {
                    if (strangerVideoRef.current) {
                        strangerVideoRef.current.srcObject = e.streams[0];
                    }
                };
            }
        } catch (error) {
            console.error('Error accessing media devices:', error);
        }
    };

    const handleRemoteSocket = async (id: string) => {
        peerRef.current.remoteSocketId = id;
        setMediaState(prev => ({ ...prev, isSearching: false, isConnected: true }));
        connectionStartTime.current = Date.now();

        peerRef.current.peer = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        });

        peerRef.current.peer.onnegotiationneeded = async () => {
            if (peerRef.current.type === 'p1') {
                const offer = await peerRef.current.peer!.createOffer();
                await peerRef.current.peer!.setLocalDescription(offer);
                socketRef.current?.emit('sdp:send', {
                    sdp: peerRef.current.peer!.localDescription
                });
            }
        };

        peerRef.current.peer.onicecandidate = (e) => {
            if (e.candidate) {
                socketRef.current?.emit('ice:send', {
                    candidate: e.candidate,
                    to: peerRef.current.remoteSocketId
                });
            }
        };

        await startMediaCapture();
    };

    const handleSdpReply = async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
        await peerRef.current.peer?.setRemoteDescription(new RTCSessionDescription(sdp));

        if (peerRef.current.type === 'p2') {
            const answer = await peerRef.current.peer!.createAnswer();
            await peerRef.current.peer!.setLocalDescription(answer);
            socketRef.current?.emit('sdp:send', {
                sdp: peerRef.current.peer!.localDescription
            });
        }
    };

    const handleIceReply = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        if (candidate) {
            await peerRef.current.peer?.addIceCandidate(new RTCIceCandidate(candidate));
        }
    };

    const handleGetMessage = (text: string) => {
        setMessages(prev => [...prev, {
            text,
            sender: 'stranger',
            timestamp: Date.now()
        }]);
    };

    const handleDisconnect = () => {
        cleanup();
        setMediaState(prev => ({ ...prev, isConnected: false, isSearching: false }));
        setMessages([]);
        connectionStartTime.current = null;
        setConnectionDuration(0);
    };

    const cleanup = () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        peerRef.current.peer?.close();
        peerRef.current = {
            peer: null,
            remoteSocketId: null,
            type: null,
            roomId: null
        };
        if (myVideoRef.current) myVideoRef.current.srcObject = null;
        if (strangerVideoRef.current) strangerVideoRef.current.srcObject = null;
    };

    const startConnection = () => {
        console.log('🚀 Starting connection with preferences:', userPreferences);
        setMediaState(prev => ({ ...prev, isSearching: true }));
        setMessages([]);
        socketRef.current?.emit('start', userPreferences, (type: 'p1' | 'p2') => {
            peerRef.current.type = type;
        });
    };

    const skipConnection = () => {
        cleanup();
        socketRef.current?.disconnect();

        // Reconectar e re-registrar event listeners
        socketRef.current = io(SERVER_URL);

        socketRef.current.on('online', (count: number) => {
            setOnlineUsers(count);
        });
        socketRef.current.on('remote-socket', handleRemoteSocket);
        socketRef.current.on('sdp:reply', handleSdpReply);
        socketRef.current.on('ice:reply', handleIceReply);
        socketRef.current.on('roomid', (id: string) => {
            peerRef.current.roomId = id;
        });
        socketRef.current.on('get-message', handleGetMessage);
        socketRef.current.on('disconnected', handleDisconnect);

        // Iniciar nova conexão com as MESMAS preferências
        startConnection();
    };

    const cancelSearch = () => {
        console.log('🛑 Cancelando busca...');
        cleanup();
        setMediaState(prev => ({ ...prev, isSearching: false, isConnected: false }));
        setMessages([]);
        connectionStartTime.current = null;
        setConnectionDuration(0);

        // Disconnect from current search
        socketRef.current?.emit('cancel-search');
    };

    const sendMessage = (text: string) => {
        if (!text.trim()) return;

        setMessages(prev => [...prev, {
            text,
            sender: 'you',
            timestamp: Date.now()
        }]);

        socketRef.current?.emit('send-message', text, peerRef.current.type, peerRef.current.roomId);
    };

    const toggleAudio = () => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setMediaState(prev => ({ ...prev, audioEnabled: audioTrack.enabled }));
            }
        }
    };

    const toggleVideo = () => {
        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setMediaState(prev => ({ ...prev, videoEnabled: videoTrack.enabled }));
            }
        }
    };

    const sendMatchRequest = (contactType: string, contactValue: string) => {
        socketRef.current?.emit('match:request', {
            to: peerRef.current.remoteSocketId,
            contactType,
            contactValue,
            userPreferences
        });
    };

    // Connection duration timer
    useEffect(() => {
        let interval: number | null = null;

        if (mediaState.isConnected && connectionStartTime.current) {
            interval = window.setInterval(() => {
                const elapsed = Math.floor((Date.now() - connectionStartTime.current!) / 1000);
                setConnectionDuration(elapsed);
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [mediaState.isConnected]);

    // Match request socket listeners
    useEffect(() => {
        if (!socketRef.current) return;

        const handleMatchRequest = (data: { from: string; contactType: string; contactValue: string }) => {
            // Store match request for UI to handle
            console.log('Match request received:', data);
            // You can emit a custom event or use a callback prop here
        };

        const handleMatchAccepted = (data: { contactType: string; contactValue: string }) => {
            console.log('Match accepted:', data);
            // Handle successful match
        };

        const handleMatchRejected = () => {
            console.log('Match rejected');
            // Handle rejection
        };

        socketRef.current.on('match:request', handleMatchRequest);
        socketRef.current.on('match:accepted', handleMatchAccepted);
        socketRef.current.on('match:rejected', handleMatchRejected);

        return () => {
            socketRef.current?.off('match:request', handleMatchRequest);
            socketRef.current?.off('match:accepted', handleMatchAccepted);
            socketRef.current?.off('match:rejected', handleMatchRejected);
        };
    }, []);

    return (
        <WebRTCContext.Provider value={{
            messages,
            mediaState,
            onlineUsers,
            connectionDuration,
            userPreferences,
            socket: socketRef.current,
            peerConnection: peerRef.current,
            setUserPreferences,
            sendMessage,
            toggleAudio,
            toggleVideo,
            startConnection,
            skipConnection,
            cancelSearch,
            sendMatchRequest,
            myVideoRef,
            strangerVideoRef
        }}>
            {children}
        </WebRTCContext.Provider>
    );
};

export const useWebRTC = () => {
    const context = useContext(WebRTCContext);
    if (!context) {
        throw new Error('useWebRTC must be used within WebRTCProvider');
    }
    return context;
};
