import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, AuthUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// In-memory user storage (replace with database in production)
export const users: Map<string, User> = new Map();

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

export const generateToken = (user: AuthUser): string => {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

export const verifyToken = (token: string): AuthUser | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
        return decoded;
    } catch (error) {
        return null;
    }
};

export const createUser = async (email: string, password: string, name: string): Promise<User> => {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const hashedPassword = await hashPassword(password);

    const user: User = {
        id,
        email,
        name,
        password: hashedPassword,
        createdAt: Date.now(),
    };

    users.set(id, user);
    users.set(email, user); // Also store by email for lookup

    return user;
};

export const findUserByEmail = (email: string): User | undefined => {
    return users.get(email);
};

export const findUserById = (id: string): User | undefined => {
    return users.get(id);
};

export const createGoogleUser = (googleId: string, email: string, name: string): User => {
    const existingUser = findUserByEmail(email);
    if (existingUser) {
        return existingUser;
    }

    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: User = {
        id,
        email,
        name,
        googleId,
        createdAt: Date.now(),
    };

    users.set(id, user);
    users.set(email, user);

    return user;
};
