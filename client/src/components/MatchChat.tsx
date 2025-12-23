import React, { useEffect, useState, useRef } from 'react';
import { Match, ChatMessage } from '../types';
import { useWebRTC } from '../contexts/WebRTCContext';
import './MatchChat.css';

interface MatchChatProps {
    match: Match;
    onBack: () => void;
}

const MatchChat: React.FC<MatchChatProps> = ({ match, onBack }) => {
    const [messages, setMessages] = useState<ChatMessage[]>(match.messages);
    const [inputText, setInputText] = useState('');
    const { socket } = useWebRTC();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Mark messages as read
        if (socket) {
            socket.emit('match:read', { matchId: match.matchId });
        }

        // Listen for new messages
        const handleNewMessage = ({ matchId, message }: { matchId: string; message: ChatMessage }) => {
            if (matchId === match.matchId) {
                setMessages(prev => [...prev, message]);
                // Mark as read immediately since we're in the chat
                socket?.emit('match:read', { matchId });
            }
        };

        // Listen for messages read confirmation
        const handleMessagesRead = ({ matchId }: { matchId: string }) => {
            if (matchId === match.matchId) {
                setMessages(prev => prev.map(msg =>
                    msg.senderId === socket?.id ? { ...msg, read: true } : msg
                ));
            }
        };

        socket?.on('match:message', handleNewMessage);
        socket?.on('match:messages_read', handleMessagesRead);

        return () => {
            socket?.off('match:message', handleNewMessage);
            socket?.off('match:messages_read', handleMessagesRead);
        };
    }, [socket, match.matchId]);

    useEffect(() => {
        // Scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (!inputText.trim() || !socket) return;

        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newMessage: ChatMessage = {
            id: messageId,
            senderId: socket.id || '',
            text: inputText,
            timestamp: Date.now(),
            read: false
        };

        // Add to local state immediately
        setMessages(prev => [...prev, newMessage]);

        // Send to server
        socket.emit('match:message', {
            matchId: match.matchId,
            text: inputText
        });

        setInputText('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="match-chat-overlay">
            <div className="match-chat-container">
                <div className="match-chat-header">
                    <button className="back-button" onClick={onBack}>
                        ←
                    </button>
                    <div className="match-chat-info">
                        <div className="match-chat-avatar">👤</div>
                        <div>
                            <div className="match-chat-name">Match</div>
                            <div className="match-chat-interests">
                                {match.otherUser.interests.slice(0, 3).join(', ')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="match-chat-messages">
                    {messages.length === 0 ? (
                        <div className="no-messages">
                            <p>👋 Comece a conversa!</p>
                            <p className="hint">Vocês deram match! Agora podem conversar à vontade.</p>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div
                                key={msg.id}
                                className={`message ${msg.senderId === socket?.id ? 'sent' : 'received'}`}
                            >
                                <div className="message-content">
                                    {msg.text}
                                </div>
                                <div className="message-time">
                                    {formatTime(msg.timestamp)}
                                    {msg.senderId === socket?.id && (
                                        <span className="message-status">
                                            {msg.read ? '✓✓' : '✓'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="match-chat-input">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Digite sua mensagem..."
                        maxLength={500}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!inputText.trim()}
                        className="send-button"
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MatchChat;
