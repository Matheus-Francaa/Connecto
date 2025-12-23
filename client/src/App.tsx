import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { WebRTCProvider, useWebRTC } from './contexts/WebRTCContext';
import Home from './components/Home';
import VideoChat from './components/VideoChat';
import './styles/global.css';

const AppContent: React.FC = () => {
    const { mediaState } = useWebRTC();

    // Show VideoChat if searching or connected
    if (mediaState.isSearching || mediaState.isConnected) {
        return <VideoChat />;
    }

    return <Home />;
};

const AppWrapper: React.FC = () => {
    return (
        <ThemeProvider>
            <WebRTCProvider>
                <AppContent />
            </WebRTCProvider>
        </ThemeProvider>
    );
};

function App() {
    return <AppWrapper />;
}

export default App;
