import React from 'react';
import { useWebRTC } from '../contexts/WebRTCContext';
import { useTheme } from '../contexts/ThemeContext';
import './MediaControls.css';

const MINIMUM_CONNECTION_TIME = 10; // 10 seconds

const MediaControls: React.FC = () => {
    const {
        mediaState,
        toggleAudio,
        toggleVideo,
        skipConnection,
        userPreferences,
        connectionDuration,
        socket,
        peerConnection
    } = useWebRTC();

    const handleLike = () => {
        if (socket && peerConnection.remoteSocketId && peerConnection.roomId) {
            socket.emit('like:send', {
                to: peerConnection.remoteSocketId,
                roomId: peerConnection.roomId
            });
            console.log('❤️ Like enviado para', peerConnection.remoteSocketId);
        }
    };
    const { theme, toggleTheme } = useTheme();

    const isConnectionsMode = userPreferences?.mode === 'connections';
    const isSkipDisabled = !mediaState.isConnected ||
        (isConnectionsMode && connectionDuration < MINIMUM_CONNECTION_TIME);
    const canShowLike = isConnectionsMode && mediaState.isConnected && connectionDuration >= MINIMUM_CONNECTION_TIME;

    const getRemainingTime = () => {
        if (!isConnectionsMode || connectionDuration >= MINIMUM_CONNECTION_TIME) {
            return null;
        }
        const remaining = MINIMUM_CONNECTION_TIME - connectionDuration;
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const remainingTime = getRemainingTime();

    return (
        <div className="media-controls">
            <button
                className={`control-button ${!mediaState.audioEnabled ? 'disabled' : ''}`}
                onClick={toggleAudio}
                title={mediaState.audioEnabled ? 'Mute' : 'Unmute'}
            >
                {mediaState.audioEnabled ? '🎤' : '🔇'}
            </button>

            <button
                className={`control-button ${!mediaState.videoEnabled ? 'disabled' : ''}`}
                onClick={toggleVideo}
                title={mediaState.videoEnabled ? 'Stop video' : 'Start video'}
            >
                {mediaState.videoEnabled ? '📹' : '📴'}
            </button>

            <button
                className="control-button skip-button"
                onClick={skipConnection}
                disabled={isSkipDisabled}
                title={remainingTime ? `Wait ${remainingTime} to skip` : 'Next stranger'}
            >
                {remainingTime ? `⏱️ ${remainingTime}` : '⏭️'}
            </button>

            {canShowLike && (
                <button
                    className="control-button like-button"
                    onClick={handleLike}
                    title="Send like"
                >
                    ❤️
                </button>
            )}

            <button
                className="control-button theme-button"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
                {theme === 'light' ? '🌙' : '☀️'}
            </button>
        </div>
    );
};

export default MediaControls;
