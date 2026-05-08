#!/bin/bash

# OpenClaw Startup Script for Mac/Linux
echo "🚀 Starting OpenClaw Ecosystem..."

# Function to kill background processes on exit
cleanup() {
    echo "Stopping services..."
    kill $(jobs -p)
    exit
}
trap cleanup SIGINT

# 1. Start Backend API
echo "📦 Launching Backend API..."
(cd backend && npm run dev) &
BACKEND_PID=$!

# 2. Start OpenClaw Agent
echo "🤖 Launching OpenClaw Agent..."
(cd openclaw && node server.js) &
AGENT_PID=$!

# 3. Start Frontend
echo "💻 Launching Frontend..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo "⏳ Waiting for services to initialize..."
sleep 5

echo ""
echo "✅ All services launched!"
echo "------------------------------------------"
echo "- Frontend: http://localhost:5173"
echo "- Backend:  http://localhost:3000"
echo "- Agent:    http://localhost:4000"
echo "------------------------------------------"
echo "Press Ctrl+C to stop all services."

# 4. Run the final sync/pipeline
(cd openclaw && node run.js)

# Keep script running to maintain background processes
wait
