import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { WebRTCProvider, useWebRTC } from './contexts/WebRTCContext';
import Home from './components/Home';
import VideoChat from './components/VideoChat';
import Login from './components/Login';
import AuthCallback from './components/AuthCallback';
import './styles/global.css';

interface User {
    id: string;
    email: string;
    name: string;
}

const AppContent: React.FC = () => {
    const { mediaState, socket } = useWebRTC();
    const [user, setUser] = useState<User | null>(null);
    const [isGuest, setIsGuest] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);

                // Authenticate socket
                if (socket) {
                    socket.emit('auth:authenticate', { token });
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }

        setLoading(false);
    }, [socket]);

    const handleLoginSuccess = (userData: User) => {
        setUser(userData);
    };

    const handleGuestContinue = () => {
        setIsGuest(true);
    };

    const handleUpdateUser = (userData: User) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsGuest(false);
        window.location.reload();
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid var(--primary-color)',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
            </div>
        );
    }

    // Show VideoChat if searching or connected
    if (mediaState.isSearching || mediaState.isConnected) {
        return <VideoChat />;
    }

    // Show login if not authenticated and not guest
    if (!user && !isGuest) {
        return <Login onLoginSuccess={handleLoginSuccess} onGuestContinue={handleGuestContinue} />;
    }

    return <Home user={user} isGuest={isGuest} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />;
};

const AppWrapper: React.FC = () => {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <WebRTCProvider>
                    <Routes>
                        <Route path="/" element={<AppContent />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </WebRTCProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
};

function App() {
    return <AppWrapper />;
}

export default App;
