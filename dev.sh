#!/bin/bash

echo "🚀 Starting Iggle Development Environment"
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $SERVER_PID $CLIENT_PID 2>/dev/null
    exit 0
}

# Set up trap to catch SIGINT (Ctrl+C)
trap cleanup SIGINT

# Start server
echo "📡 Starting server..."
cd server
npm start &
SERVER_PID=$!
cd ..

# Wait a bit for server to start
sleep 3

# Start client
echo "🎨 Starting client..."
cd client
npm run dev &
CLIENT_PID=$!
cd ..

echo ""
echo "✅ Development environment is ready!"
echo "   Server: http://localhost:8000"
echo "   Client: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for processes
wait
