# PowerShell script to set up the entire job application project

Write-Host "====== JOB APPLICATION PROJECT SETUP ======" -ForegroundColor Green
Write-Host "This script will set up and configure the entire application" -ForegroundColor Yellow

# Make sure all scripts are executable
Write-Host "Setting up execution permissions..." -ForegroundColor Cyan
wsl -d Ubuntu -e bash -c "chmod +x /mnt/c/Job\ application\ project/backend/custom_app/restart_frappe.sh"
wsl -d Ubuntu -e bash -c "chmod +x /mnt/c/Job\ application\ project/frontend/restart.sh"

# Setup user roles and permissions
Write-Host "Setting up roles and permissions in Frappe..." -ForegroundColor Cyan
wsl -d Ubuntu -e bash -c "cd ~/frappe-project/frappe-bench && source ~/frappe-env/bin/activate && python -c 'import sys; sys.path.append(\"/mnt/c/Job application project/backend\"); from custom_app.setup_roles import execute; execute()'"

# Stop any existing processes
Write-Host "Stopping any existing processes..." -ForegroundColor Cyan
wsl -d Ubuntu -e bash -c "pkill -f redis || true"
wsl -d Ubuntu -e bash -c "pkill -f frappe || true"
wsl -d Ubuntu -e bash -c "pkill -f node || true"
wsl -d Ubuntu -e bash -c "pkill -f python || true"

Write-Host "Waiting for processes to terminate..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

# Start the backend in a new window
Write-Host "Starting backend..." -ForegroundColor Green
Start-Process wt -ArgumentList "wsl -d Ubuntu -e bash -c `"cd /mnt/c/Job\\ application\\ project/backend/custom_app && ./restart_frappe.sh && bash`""

# Wait for the backend to start up
Write-Host "Waiting for backend to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 20

# Kill any existing Node.js processes to ensure clean frontend restart
Write-Host "Preparing frontend environment..." -ForegroundColor Cyan
wsl -d Ubuntu -e bash -c "pkill -f node || true"
Start-Sleep -Seconds 2

# Start frontend in a new window
Write-Host "Starting frontend..." -ForegroundColor Green
Start-Process wt -ArgumentList "wsl -d Ubuntu -e bash -c `"cd /mnt/c/Job\\ application\\ project/frontend && npm start`""

Write-Host "====== SETUP COMPLETED ======" -ForegroundColor Green
Write-Host "Backend should be running at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend should be running at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Applications are starting in separate terminal windows..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Login credentials:" -ForegroundColor Yellow
Write-Host "1. Administrator:" -ForegroundColor White
Write-Host "   Email: admin@example.com" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "2. Task Manager:" -ForegroundColor White
Write-Host "   Email: manager@example.com" -ForegroundColor White
Write-Host "   Password: manager123" -ForegroundColor White
Write-Host ""
Write-Host "3. Regular User:" -ForegroundColor White
Write-Host "   Email: user@example.com" -ForegroundColor White
Write-Host "   Password: user123" -ForegroundColor White
Write-Host ""
Write-Host "NOTE: The application implements role-based permissions:" -ForegroundColor Green
Write-Host "      - Administrators can perform all actions" -ForegroundColor Green
Write-Host "      - Task Managers can create, edit, and view tasks but not delete them" -ForegroundColor Green
Write-Host "      - Regular Users can only view tasks" -ForegroundColor Green 