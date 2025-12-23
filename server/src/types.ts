export interface room {
  roomid: string,
  isAvailable: boolean,
  p1: {
    id: string | null,
    preferences?: UserPreferences,
  },
  p2: {
    id: string | null,
    preferences?: UserPreferences,
  }
}

export type GetTypesResult =
  | { type: 'p1', p2id: string | null }
  | { type: 'p2', p1id: string | null }
  | false;

export type ChatMode = 'casual' | 'connections';

export interface UserPreferences {
  mode: ChatMode;
  interests: string[];
  ageRange?: {
    min: number;
    max: number;
  };
  gender?: 'male' | 'female' | 'other';
  lookingFor?: 'male' | 'female' | 'any';
}

export interface MatchRequest {
  from: string;
  to: string;
  contactType: string;
  contactValue: string;
  userPreferences: UserPreferences | null;
}

export interface Match {
  matchId: string;
  user1: MatchUser;
  user2: MatchUser;
  timestamp: number;
  messages: ChatMessage[];
}

export interface MatchUser {
  socketId: string;
  interests: string[];
  lastSeen: number;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface LikeData {
  from: string;
  to: string;
  roomId: string;
}