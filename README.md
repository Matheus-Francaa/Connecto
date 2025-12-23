# Connecto - Conversas Reais, Conexões Autênticas 🎥💕

<div align="center">

![Connecto Logo](https://img.shields.io/badge/Connecto-Video_Chat-8b5cf6?style=for-the-badge&logo=video&logoColor=white)

**Plataforma híbrida que combina conversas cara a cara com matching baseado em interesses**

[![React](https://img.shields.io/badge/React-19.2-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![WebRTC](https://img.shields.io/badge/WebRTC-Enabled-ff6b6b?style=flat-square)](https://webrtc.org/)

[🔴 Watch Demo on YouTube](https://youtu.be/GZyKcIvQqi8) | [📖 Differential Features](./DIFFERENTIAL_FEATURES.md)

</div>

---

## 🌟 What Makes This Different?

Diferente de apps de namoro tradicionais que dependem de fotos e bios, ou apps de chat aleatório sem forma de continuar boas conversas, **Connecto** combina o melhor dos dois mundos:

- 🎲 **Casual Chat Mode**: Pure Omegle-style random video chats
- 💕 **Real Connections Mode**: Interest-based matching + post-conversation contact exchange
- 🎯 **Smart Matching**: Algorithm pairs users based on shared interests
- ⏱️ **Quality Time**: Minimum conversation time in Connections mode
- 🤝 **Privacy-First Matching**: Contact info shared only on mutual interest

> **Philosophy**: Real conversations reveal compatibility better than filtered photos. Let genuine interactions happen first, then decide to connect.

See [DIFFERENTIAL_FEATURES.md](./DIFFERENTIAL_FEATURES.md) for detailed feature explanation.

---

## ✨ Features

### Core Features
- 🎥 **Real-time Video Chat** - Instant peer-to-peer video connections using WebRTC
- 💬 **Live Messaging** - Text chat alongside video
- 🎨 **Modern UI/UX** - Beautiful, responsive React interface
- 🌓 **Dark/Light Theme** - Toggle between themes with localStorage persistence
- 🎛️ **Media Controls** - Mute/unmute audio and video
- ⏭️ **Skip Connection** - Next stranger with one click
- 📱 **Mobile Responsive** - Works on all devices
- 🔒 **Anonymous** - No registration required
- ⚡ **Fast & Reliable** - Optimized WebRTC connections with STUN servers

### Differential Features 🌟
- 🎯 **Dual-Mode System**: Choose between Casual Chat or Real Connections
- 🏷️ **16 Interest Tags**: Music, Movies, Sports, Travel, Tech, and more
- 👤 **Optional Profiles**: Age, gender, and preference matching (Connections mode)
- 🧮 **Smart Matching Algorithm**: Scores compatibility based on interests and preferences
- ⏱️ **Minimum Chat Time**: 3-minute requirement in Connections mode
- 💌 **Match System**: Exchange Instagram/WhatsApp/Email after good conversations
- 🔐 **Privacy-Preserving**: Contact shared only on mutual match acceptance

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/amitanshusahu/Omegle-fullstack.git
cd Omegle-fullstack
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Configure environment variables**
```bash
# In the server directory, copy .env.example to .env
cd ../server
cp .env.example .env
```

### Running the Application

1. **Start the server**
```bash
cd server
npm start
```

Server will run on `http://localhost:8000`

2. **Start the client** (in a new terminal)
```bash
cd client
npm run dev
```

Client will run on `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

---

## 🏗️ Project Structure

```
Omegle-fullstack/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # Context providers
│   │   ├── styles/        # CSS styles
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
└── server/                # Node.js backend
    ├── src/
    │   ├── config/        # Configuration
    │   ├── middleware/    # Express middleware
    │   ├── utils/         # Utilities
    │   ├── index.ts       # Server entry point
    │   ├── lib.ts         # Core logic
    │   └── types.ts       # TypeScript types
    ├── .env.example
    ├── package.json
    └── tsconfig.json
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Socket.io Client** - Real-time communication
- **WebRTC** - Peer-to-peer connections
- **CSS3** - Styling with custom properties

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Socket.io** - WebSocket server
- **Winston** - Logging
- **dotenv** - Environment configuration

---

## 🎯 How It Works

1. **User Connection**: When a user clicks "Start Chatting", they connect to the signaling server via Socket.io
2. **Matching**: The server pairs two users in a room
3. **WebRTC Negotiation**: 
   - Peer 1 creates an offer (SDP)
   - Peer 2 receives the offer and creates an answer
   - ICE candidates are exchanged for NAT traversal
4. **Media Streaming**: Once connected, video/audio streams flow directly between peers
5. **Chat**: Text messages are relayed through the server
6. **Skip**: Users can disconnect and be matched with a new stranger

---

## 📝 API Reference

### Socket Events

**Client → Server**
- `start` - Request to start matching
- `ice:send` - Send ICE candidate
- `sdp:send` - Send SDP offer/answer
- `send-message` - Send chat message

**Server → Client**
- `online` - Update online users count
- `remote-socket` - Matched with peer
- `roomid` - Room assignment
- `ice:reply` - Receive ICE candidate
- `sdp:reply` - Receive SDP offer/answer
- `get-message` - Receive chat message
- `disconnected` - Peer disconnected

---

## 🔧 Configuration

### Server Environment Variables
```env
PORT=8000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Client Configuration
Edit `src/contexts/WebRTCContext.tsx` to change the server URL:
```typescript
const SERVER_URL = 'http://localhost:8000';
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the ISC License.

---

## 🙏 Acknowledgments

- [WebRTC Crash Course - deep dive](https://youtu.be/FExZvpVvYxA)
- [WebRTC Documentation](https://webrtc.org/)
- [Socket.io Documentation](https://socket.io/)
- [React Documentation](https://react.dev/)

---

<div align="center">

**Made with ❤️ and TypeScript**

<h1 align="center"> ⭐ Star the Repo ⭐ </h1>

</div>
