#!/bin/bash

echo "====== RESTARTING FRAPPE WITH CUSTOM CONFIGURATION ======"

# Activate the virtual environment
source ~/frappe-env/bin/activate || { echo "Failed to activate virtual environment"; exit 1; }

# Set up Frappe environment
cd ~/frappe-project/frappe-bench || { echo "Failed to change to bench directory"; exit 1; }

# Kill any existing processes
echo "Stopping existing processes..."
pkill -f "redis-server.*14000" || true
pkill -f "redis-server.*12000" || true
pkill -f "redis-server.*13000" || true
pkill -f "redis-server.*11000" || true

echo "Stopping Frappe processes..."
pkill -f frappe || true
pkill -f gunicorn || true

# Wait a moment for processes to terminate
echo "Waiting for processes to terminate..."
sleep 3

# Check if Redis ports are free
echo "Checking Redis ports..."
if lsof -i:11000 > /dev/null 2>&1 || lsof -i:13000 > /dev/null 2>&1 || lsof -i:12000 > /dev/null 2>&1 || lsof -i:14000 > /dev/null 2>&1; then
  echo "Redis ports are still in use. Trying fuser to kill processes..."
  fuser -k 11000/tcp 13000/tcp 12000/tcp 14000/tcp || true
  sleep 2
fi

# Start custom Redis instances
echo "Starting Redis with custom ports..."
redis-server /mnt/c/Job\ application\ project/backend/custom_app/redis_config.conf
redis-server /mnt/c/Job\ application\ project/backend/custom_app/redis_queue.conf

# Modify the site's configuration to use our custom Redis
echo "Updating site configuration..."
cat > ~/frappe-project/frappe-bench/sites/task-management.local/site_config.json << EOF
{
  "db_name": "task-management",
  "db_password": "task-management",
  "allow_cors": 1,
  "cors_domains": ["http://localhost:3000", "http://127.0.0.1:3000"],
  "redis_cache": "redis://localhost:14000",
  "redis_queue": "redis://localhost:12000"
}
EOF

# Configure CORS settings
echo "Configuring CORS settings..."
bench --site task-management.local set-config allow_cors 1
bench --site task-management.local set-config cors_domains '["http://localhost:3000", "http://127.0.0.1:3000"]'

# Create test user if needed
echo "Creating test user for login..."
bench --site task-management.local add-user test@example.com --first-name Test --last-name User --password test123 || true

# Reset Administrator password
echo "Resetting Administrator password..."
bench --site task-management.local set-admin-password admin123 || true

# Clear cache
echo "Clearing cache..."
bench clear-cache

# Start Frappe services individually
echo "Starting Frappe services individually..."
cd ~/frappe-project/frappe-bench

# Start the web server
echo "Starting web server..."
python -m frappe.www > /dev/null 2>&1 &

# Start socket.io
echo "Starting socket.io..."
python -m frappe.socketio > /dev/null 2>&1 &

# Start workers
echo "Starting workers..."
python -m frappe.workers.default > /dev/null 2>&1 &

# Start scheduler
echo "Starting scheduler..."
python -m frappe.utils.scheduler > /dev/null 2>&1 &

echo "====== FRAPPE SERVICES STARTED ======"
echo "Backend should be running at: http://localhost:8000"
echo ""
echo "Login credentials:"
echo "1. Email: test@example.com"
echo "   Password: test123"
echo ""
echo "2. Username: Administrator"
echo "   Password: admin123" 