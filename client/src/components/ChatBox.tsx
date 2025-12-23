import React, { useState, useEffect, useRef } from 'react';
import { useWebRTC } from '../contexts/WebRTCContext';
import './ChatBox.css';

const ChatBox: React.FC = () => {
    const { messages, sendMessage, mediaState } = useWebRTC();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && mediaState.isConnected) {
            sendMessage(inputValue);
            setInputValue('');
        }
    };

    return (
        <div className="chat-box">
            <div className="chat-header">
                <h3>Chat</h3>
                <span className="connection-status">
                    {mediaState.isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                </span>
            </div>

            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="empty-chat">
                        <p>Start a conversation...</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.sender}`}>
                            <span className="message-sender">
                                {msg.sender === 'you' ? 'You' : 'Stranger'}:
                            </span>
                            <span className="message-text">{msg.text}</span>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-form" onSubmit={handleSend}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={mediaState.isConnected ? "Type a message..." : "Connect to chat"}
                    disabled={!mediaState.isConnected}
                    className="chat-input"
                />
                <button
                    type="submit"
                    disabled={!mediaState.isConnected || !inputValue.trim()}
                    className="send-button"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatBox;
