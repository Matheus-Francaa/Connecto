import React, { useState } from 'react';
import { useWebRTC } from '../contexts/WebRTCContext';
import ModeSelector from './ModeSelector';
import InterestsSelector from './InterestsSelector';
import MatchesList from './MatchesList';
import MatchChat from './MatchChat';
import { ChatMode, UserPreferences, Match } from '../types';
import './Home.css';

const Home: React.FC = () => {
    const { startConnection, onlineUsers, setUserPreferences, socket } = useWebRTC();
    const [step, setStep] = useState<'mode' | 'interests' | 'home'>('home');
    const [selectedMode, setSelectedMode] = useState<ChatMode | null>(null);
    const [showMatches, setShowMatches] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);

    // Listen for matches events
    React.useEffect(() => {
        if (socket) {
            // Load matches when socket connects
            socket.emit('matches:get', (userMatches: Match[]) => {
                setMatches(userMatches);
            });

            // Listen for new matches
            socket.on('match:mutual', ({ matchId, otherUser }) => {
                const newMatch: Match = {
                    matchId,
                    otherUser,
                    messages: [],
                    unreadCount: 0
                };
                setMatches(prev => [newMatch, ...prev]);
                alert('🎉 Você tem um novo match!');
            });

            // Listen for new messages
            socket.on('match:message', ({ matchId, message }) => {
                setMatches(prev => prev.map(match => {
                    if (match.matchId === matchId) {
                        return {
                            ...match,
                            messages: [...match.messages, message],
                            unreadCount: match.unreadCount + 1
                        };
                    }
                    return match;
                }));
            });

            // Listen for unmatched
            socket.on('match:unmatched', ({ matchId }) => {
                setMatches(prev => prev.filter(match => match.matchId !== matchId));
                // If currently viewing this match, close it
                if (selectedMatch?.matchId === matchId) {
                    setSelectedMatch(null);
                    setShowMatches(false);
                }
            });

            return () => {
                socket.off('match:mutual');
                socket.off('match:message');
                socket.off('match:unmatched');
            };
        }
    }, [socket, selectedMatch]);

    const handleModeSelect = (mode: ChatMode) => {
        setSelectedMode(mode);
        setStep('interests');
    };

    const handleInterestsComplete = (preferences: UserPreferences) => {
        setUserPreferences(preferences);
        startConnection();
    };

    const handleBackToMode = () => {
        setStep('mode');
        setSelectedMode(null);
    };

    const handleBackToHome = () => {
        setStep('home');
        setSelectedMode(null);
    };

    const handleOpenMatches = () => {
        setShowMatches(true);
    };

    const handleCloseMatches = () => {
        setShowMatches(false);
        setSelectedMatch(null);
    };

    const handleSelectMatch = (matchId: string) => {
        const match = matches.find(m => m.matchId === matchId);
        if (match) {
            // Reset unread count when opening a match
            setMatches(prev => prev.map(m =>
                m.matchId === matchId ? { ...m, unreadCount: 0 } : m
            ));
            setSelectedMatch(match);
        }
    };

    const handleBackToList = () => {
        setSelectedMatch(null);
    };

    if (step === 'interests' && selectedMode) {
        return <InterestsSelector mode={selectedMode} onComplete={handleInterestsComplete} onBack={handleBackToMode} />;
    }

    if (step === 'mode') {
        return (
            <div className="home-container">
                <button className="back-to-home-button" onClick={handleBackToHome}>
                    ← Voltar
                </button>
                <ModeSelector onModeSelect={handleModeSelect} />
            </div>
        );
    }

    // Render match chat if a match is selected
    if (selectedMatch) {
        return <MatchChat match={selectedMatch} onBack={handleBackToList} />;
    }

    // Render matches list if showMatches is true
    if (showMatches) {
        return <MatchesList onClose={handleCloseMatches} onSelectMatch={handleSelectMatch} />;
    }

    // Calculate total unread messages
    const totalUnread = matches.reduce((sum, match) => sum + match.unreadCount, 0);

    return (
        <div className="home-container">
            <button className="matches-button" onClick={handleOpenMatches}>
                💕 Matches
                {totalUnread > 0 && (
                    <span className="matches-badge">{totalUnread > 99 ? '99+' : totalUnread}</span>
                )}
            </button>

            <div className="home-content">
                <div className="logo-section">
                    <h1 className="logo-text">
                        <span className="logo-icon">🎥</span>
                        Connecto
                    </h1>
                    <p className="logo-subtitle">Conexões reais além das aparências</p>
                </div>

                <div className="info-card">
                    <div className="online-indicator">
                        <span className="pulse-dot"></span>
                        <span className="online-text">{onlineUsers} pessoas online</span>
                    </div>

                    <div className="features">
                        <div className="feature-item">
                            <span className="feature-icon">💬</span>
                            <span>Conversas casuais</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">💝</span>
                            <span>Conhecer pessoas de verdade</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">✨</span>
                            <span>Conexões autênticas</span>
                        </div>
                    </div>
                </div>

                <button className="start-button" onClick={() => setStep('mode')}>
                    <span className="button-text">Começar</span>
                    <span className="button-icon">→</span>
                </button>

                <p className="disclaimer">
                    Ao usar o Connecto, você concorda com nossos termos. Seja respeitoso e autêntico.
                </p>
            </div>

            <div className="background-decoration">
                <div className="decoration-circle circle-1"></div>
                <div className="decoration-circle circle-2"></div>
                <div className="decoration-circle circle-3"></div>
            </div>
        </div>
    );
};

export default Home;
