import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import {
    createUser,
    findUserByEmail,
    comparePassword,
    generateToken,
    createGoogleUser,
    verifyToken,
    hashPassword,
    users,
} from '../services/authService';
import { config } from '../config/env';
import { User } from '../models/User';

const router = Router();

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    try {
        const decoded = verifyToken(token);
        (req as any).user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido' });
    }
};

// Configure Google Strategy (only if credentials are provided)
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (googleClientId && googleClientSecret) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: googleClientId,
                clientSecret: googleClientSecret,
                callbackURL: `${config.serverUrl}/auth/google/callback`,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value || '';
                    const name = profile.displayName || '';
                    const googleId = profile.id;

                    const user = createGoogleUser(googleId, email, name);
                    return done(null, user);
                } catch (error) {
                    return done(error as Error);
                }
            }
        )
    );

    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id: string, done) => {
        done(null, { id });
    });
} else {
    console.warn('⚠️  Google OAuth credentials not configured. Google login will be disabled.');
}

// Register endpoint
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        }

        // Check if user already exists
        const existingUser = findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email já cadastrado' });
        }

        // Create user
        const user = await createUser(email, password, name);

        // Generate token
        const token = generateToken({ id: user.id, email: user.email, name: user.name });

        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Erro ao criar conta' });
    }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email e senha são obrigatórios' });
        }

        // Find user
        const user = findUserByEmail(email);
        if (!user || !user.password) {
            return res.status(401).json({ message: 'Email ou senha incorretos' });
        }

        // Verify password
        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Email ou senha incorretos' });
        }

        // Generate token
        const token = generateToken({ id: user.id, email: user.email, name: user.name });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Erro ao fazer login' });
    }
});

// Google OAuth routes (only if configured)
if (googleClientId && googleClientSecret) {
    router.get(
        '/google',
        passport.authenticate('google', { scope: ['profile', 'email'] })
    );

    router.get(
        '/google/callback',
        passport.authenticate('google', { session: false, failureRedirect: `${config.clientUrl}/login?error=google_auth_failed` }),
        (req: Request, res: Response) => {
            try {
                const user = req.user as any;
                const token = generateToken({ id: user.id, email: user.email, name: user.name });

                // Redirect to client with token
                res.redirect(`${config.clientUrl}/auth/callback?token=${token}`);
            } catch (error) {
                console.error('Google callback error:', error);
                res.redirect(`${config.clientUrl}/login?error=auth_failed`);
            }
        }
    );
} else {
    // Return error if Google OAuth is not configured
    router.get('/google', (req: Request, res: Response) => {
        res.status(503).json({
            message: 'Google OAuth não está configurado. Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no arquivo .env'
        });
    });

    router.get('/google/callback', (req: Request, res: Response) => {
        res.redirect(`${config.clientUrl}/login?error=google_not_configured`);
    });
}

// Update profile endpoint
router.put('/update-profile', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { name, bio, interests } = req.body;

        const user = Array.from(users.values()).find((u: User) => u.id === userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Update user data
        user.name = name || user.name;
        user.bio = bio;
        user.interests = interests;

        users.set(userId, user);

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                bio: user.bio,
                interests: user.interests,
            },
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Erro ao atualizar perfil' });
    }
});

// Change password endpoint
router.put('/change-password', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        }

        const user = Array.from(users.values()).find((u: User) => u.id === userId);
        if (!user || !user.password) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Verify current password
        const isValid = await comparePassword(currentPassword, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Senha atual incorreta' });
        }

        // Hash and update new password
        user.password = await hashPassword(newPassword);
        users.set(userId, user);

        res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Erro ao alterar senha' });
    }
});

// Delete account endpoint
router.delete('/delete-account', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const user = Array.from(users.values()).find((u: User) => u.id === userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Delete user
        users.delete(userId);

        res.json({ message: 'Conta deletada com sucesso' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Erro ao deletar conta' });
    }
});

export default router;
