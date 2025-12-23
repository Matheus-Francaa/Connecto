export interface Message {
    text: string;
    sender: 'you' | 'stranger';
    timestamp: number;
}

export interface PeerConnection {
    peer: RTCPeerConnection | null;
    remoteSocketId: string | null;
    type: 'p1' | 'p2' | null;
    roomId: string | null;
}

export interface MediaState {
    audioEnabled: boolean;
    videoEnabled: boolean;
    isConnected: boolean;
    isSearching: boolean;
}

export type Theme = 'light' | 'dark';

export type ChatMode = 'casual' | 'connections';

export interface UserPreferences {
    mode: ChatMode;
    interests: string[];
    ageRange?: {
        min: number;
        max: number;
    };
    gender?: 'male' | 'female' | 'other' | 'any';
    lookingFor?: 'male' | 'female' | 'any';
}

export interface UserProfile {
    age?: number;
    gender?: 'male' | 'female' | 'other';
    interests: string[];
    bio?: string;
}

export interface ConnectionMatch {
    timestamp: number;
    duration: number;
    matched: boolean;
    contactShared: boolean;
}

export interface Match {
    matchId: string;
    otherUser: {
        socketId: string;
        interests: string[];
        lastSeen: number;
    };
    messages: ChatMessage[];
    unreadCount: number;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: number;
    read: boolean;
}