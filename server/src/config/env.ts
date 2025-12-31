import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 8000,
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    serverUrl: process.env.SERVER_URL || 'http://localhost:8000',
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV !== 'production',
    isProduction: process.env.NODE_ENV === 'production',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
};
