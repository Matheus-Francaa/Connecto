import React, { useEffect, useState } from 'react';
import { Match } from '../types';
import { useWebRTC } from '../contexts/WebRTCContext';
import './MatchesList.css';

interface MatchesListProps {
    onClose: () => void;
    onSelectMatch: (matchId: string) => void;
}

const MatchesList: React.FC<MatchesListProps> = ({ onClose, onSelectMatch }) => {
    const [matches, setMatches] = useState<Match[]>([]);
    const { socket } = useWebRTC();

    useEffect(() => {
        if (socket) {
            // Request matches from server
            socket.emit('matches:get', (userMatches: Match[]) => {
                setMatches(userMatches);
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

            // Listen for new matches
            socket.on('match:mutual', ({ matchId, otherUser }) => {
                const newMatch: Match = {
                    matchId,
                    otherUser,
                    messages: [],
                    unreadCount: 0
                };
                setMatches(prev => [newMatch, ...prev]);
            });

            // Listen for unmatched
            socket.on('match:unmatched', ({ matchId }) => {
                setMatches(prev => prev.filter(match => match.matchId !== matchId));
            });
        }

        return () => {
            socket?.off('match:message');
            socket?.off('match:mutual');
            socket?.off('match:unmatched');
        };
    }, [socket]);

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Agora';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        return `${days}d`;
    };

    const getLastMessage = (match: Match) => {
        if (match.messages.length === 0) return 'Nova conversa!';
        const lastMsg = match.messages[match.messages.length - 1];
        return lastMsg.text.length > 50 ? lastMsg.text.substring(0, 50) + '...' : lastMsg.text;
    };

    const handleUnmatch = (matchId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering the match selection

        if (confirm('Tem certeza que deseja desfazer este match?')) {
            socket?.emit('match:unmatch', { matchId });
        }
    };

    return (
        <div className="matches-overlay">
            <div className="matches-container">
                <div className="matches-header">
                    <h2>💕 Meus Matches</h2>
                    <button className="close-button" onClick={onClose}>✕</button>
                </div>

                <div className="matches-list">
                    {matches.length === 0 ? (
                        <div className="no-matches">
                            <p>😔 Nenhum match ainda</p>
                            <p className="hint">Converse com pessoas e dê like para criar matches!</p>
                        </div>
                    ) : (
                        matches.map(match => (
                            <div
                                key={match.matchId}
                                className="match-item"
                                onClick={() => onSelectMatch(match.matchId)}
                            >
                                <div className="match-avatar">
                                    👤
                                </div>
                                <div className="match-info">
                                    <div className="match-top">
                                        <span className="match-name">
                                            Match
                                        </span>
                                        {match.messages.length > 0 && (
                                            <span className="match-time">
                                                {formatTime(match.messages[match.messages.length - 1].timestamp)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="match-interests">
                                        {match.otherUser.interests.slice(0, 3).join(', ')}
                                    </div>
                                    <div className="match-bottom">
                                        <span className="match-last-message">
                                            {getLastMessage(match)}
                                        </span>
                                        {match.unreadCount > 0 && (
                                            <span className="unread-badge">
                                                {match.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className="unmatch-button"
                                    onClick={(e) => handleUnmatch(match.matchId, e)}
                                    title="Desfazer match"
                                >
                                    ✕
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MatchesList;
