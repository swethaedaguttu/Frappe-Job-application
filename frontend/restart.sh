#!/bin/bash

# Kill any existing processes on port 3000
echo "Stopping any existing Node.js processes..."
pkill -f "node.*react-scripts" || true

# Wait a moment for processes to terminate
sleep 2

# Check if port 3000 is still in use
if lsof -i :3000 > /dev/null 2>&1; then
  echo "Port 3000 still in use. Forcing termination..."
  fuser -k 3000/tcp || true
  sleep 1
fi

# Navigate to frontend directory
cd /mnt/c/Job\ application\ project/frontend

# Install any missing dependencies
npm install

# Start the development server with automatic yes to port change if needed
export BROWSER=none
npm start -- --port 3000 