import React, { useState, useEffect } from 'react';
import { useWebRTC } from '../contexts/WebRTCContext';
import MediaControls from './MediaControls';
import ChatBox from './ChatBox';
import MatchModal from './MatchModal';
import './VideoChat.css';

const VideoChat: React.FC = () => {
    const {
        mediaState,
        myVideoRef,
        strangerVideoRef,
        cancelSearch,
        userPreferences,
        connectionDuration
    } = useWebRTC();

    const handleGoHome = () => {
        if (window.confirm('Deseja sair da chamada e voltar ao início?')) {
            cancelSearch();
            window.location.reload();
        }
    };

    const [showMatchModal, setShowMatchModal] = useState(false);
    const [wasConnected, setWasConnected] = useState(false);

    // Track connection state changes
    useEffect(() => {
        if (mediaState.isConnected) {
            setWasConnected(true);
        } else if (wasConnected && userPreferences?.mode === 'connections') {
            // Show match modal when connection ends in connections mode
            setShowMatchModal(true);
            setWasConnected(false);
        }
    }, [mediaState.isConnected, userPreferences?.mode, wasConnected]);

    const handleCloseModal = () => {
        setShowMatchModal(false);
    };

    return (
        <div className="video-chat-container">
            <button className="home-button" onClick={handleGoHome} title="Voltar ao início">
                🏠
            </button>

            {mediaState.isSearching && (
                <div className="searching-overlay">
                    <div className="searching-content">
                        <div className="spinner"></div>
                        <p className="searching-text">Looking for someone...</p>
                        <button className="cancel-button" onClick={cancelSearch}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="video-section">
                <div className="stranger-video-wrapper">
                    <video
                        ref={strangerVideoRef}
                        autoPlay
                        playsInline
                        className="stranger-video"
                    />
                    {!mediaState.isConnected && !mediaState.isSearching && (
                        <div className="video-placeholder">
                            <p>No one connected</p>
                        </div>
                    )}
                </div>

                <div className="my-video-wrapper">
                    <video
                        ref={myVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="my-video"
                    />
                    {!mediaState.videoEnabled && (
                        <div className="video-disabled-overlay">
                            <span>📹</span>
                        </div>
                    )}
                </div>

                <MediaControls />
            </div>

            <ChatBox />

            {showMatchModal && (
                <MatchModal
                    connectionDuration={connectionDuration}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default VideoChat;
