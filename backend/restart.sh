#!/bin/bash

# Activate the virtual environment
source ~/frappe-env/bin/activate

# Kill any existing processes using required ports
echo "Stopping existing processes..."
pkill -f redis || true
pkill -f frappe || true
pkill -f node || true

# Wait a moment for processes to terminate
sleep 2

# Verify ports are available
if lsof -i :11000,13000 > /dev/null 2>&1; then
  echo "Ports still in use. Forcing termination..."
  fuser -k 11000/tcp 13000/tcp || true
  sleep 1
fi

# Set up Frappe environment
cd ~/frappe-project/frappe-bench

# Configure CORS settings
echo "Configuring CORS settings..."
bench --site task-management.local set-config cors_domains '["http://localhost:3000"]'
bench --site task-management.local set-config allow_cors 1

# Clear cache and restart
echo "Clearing cache and restarting services..."
bench clear-cache
bench restart

# Create a test user if needed
echo "Creating test user for login..."
bench --site task-management.local add-user test@example.com --first-name Test --last-name User --password test123 || true

# Reset Administrator password
echo "Resetting Administrator password..."
bench --site task-management.local set-admin-password admin123 || true

# Start the server
echo "Starting Frappe server..."
bench start 