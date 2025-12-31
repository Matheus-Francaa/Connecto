export interface User {
    id: string;
    email: string;
    name: string;
    password?: string;
    googleId?: string;
    bio?: string;
    interests?: string[];
    createdAt: number;
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    socketId?: string;
}
