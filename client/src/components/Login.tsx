import React, { useState } from 'react';
import { useWebRTC } from '../contexts/WebRTCContext';
import './Login.css';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

interface LoginProps {
    onLoginSuccess: (user: any) => void;
    onGuestContinue: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onGuestContinue }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { socket } = useWebRTC();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isLogin && password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(isLogin ? { email, password } : { email, password, name }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro na autenticação');
            }

            // Save token
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Authenticate socket
            socket?.emit('auth:authenticate', { token: data.token });

            onLoginSuccess(data.user);
        } catch (err: any) {
            setError(err.message || 'Erro ao processar solicitação');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Redirect to Google OAuth
        window.location.href = `${API_URL}/auth/google`;
    };

    return (
        <div className="login-overlay">
            <div className="login-container">
                {/* Left side - Brand showcase */}
                <div className="login-showcase">
                    <div className="showcase-image">
                        <div className="showcase-mockup">
                            <span className="logo-icon">🎥</span>
                            <h2>Connecto</h2>
                            <p>Conexões reais além das aparências. Conheça pessoas de verdade através de conversas por vídeo.</p>
                        </div>
                    </div>
                </div>

                {/* Right side - Login form */}
                <div className="login-form-container">
                    <div className="login-card">
                        <div className="login-header">
                            <p className="login-subtitle">Entre ou crie sua conta</p>
                        </div>

                        <div className="login-tabs">
                            <button
                                className={`tab ${isLogin ? 'active' : ''}`}
                                onClick={() => setIsLogin(true)}
                            >
                                Login
                            </button>
                            <button
                                className={`tab ${!isLogin ? 'active' : ''}`}
                                onClick={() => setIsLogin(false)}
                            >
                                Cadastro
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="login-form">
                            {!isLogin && (
                                <div className="form-group">
                                    <label htmlFor="name">Nome</label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Seu nome completo"
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Senha</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>

                            {!isLogin && (
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirmar Senha</label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            )}

                            {error && <div className="error-message">{error}</div>}

                            <button type="submit" className="submit-button" disabled={loading}>
                                {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Criar Conta'}
                            </button>
                        </form>

                        <div className="divider">
                            <span>ou</span>
                        </div>

                        <button className="google-button" onClick={handleGoogleLogin}>
                            <svg className="google-icon" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continuar com Google
                        </button>
                    </div>

                    <div className="guest-section">
                        <div className="guest-warning">
                            ⚠️ <strong>Atenção:</strong> Continuando sem cadastro, você não terá acesso ao sistema de matches e suas conversas não serão salvas.
                        </div>
                        <button className="guest-button" onClick={onGuestContinue}>
                            Continuar sem cadastro
                        </button>
                    </div>
                </div>
            </div>

            <div className="login-background">
                <div className="decoration-circle circle-1"></div>
                <div className="decoration-circle circle-2"></div>
                <div className="decoration-circle circle-3"></div>
            </div>
        </div>
    );
};

export default Login;
