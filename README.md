# Frappe Job Application Management

A comprehensive job application management system built with Frappe Framework and React for the Job Application Project. This application demonstrates integration of a custom Frappe app with a React frontend, including role-based permissions and a complete CRUD functionality for job applications.

## Project Structure

- `backend/`: Contains the Frappe Framework custom app
  - Custom DocTypes: Job Application and Project
  - API endpoints for CRUD operations
  - Role-based permissions
  - CORS middleware for frontend connectivity
  - Setup scripts for roles and users
- `frontend/`: Contains the React frontend
  - Login screen with Frappe authentication
  - Dashboards for viewing and managing job applications and projects
  - Forms for creating and editing job applications and projects
  - Project details view with job application assignment
  - Role-based UI elements

## Features

### Backend Features
- Custom DocTypes with comprehensive fields:
  - Job Application: title, description, status, priority, dates, and project assignment
  - Project: title, description, status, dates, and job application tracking
- API endpoints for all CRUD operations
- Role-based permissions with three distinct roles
- Custom middleware for CORS handling
- Redis configuration to avoid port conflicts

### Frontend Features
- React-based SPA with React Router for navigation
- Bootstrap-based responsive UI
- Role-based UI elements (showing/hiding buttons based on user role)
- Protected routes based on user role
- Project management with job application assignment
- Progress tracking for projects
- Fallback mechanism for offline/demo operation

### Authentication & Permissions
- Three user roles implemented:
  - Administrator: Full control (create, read, update, delete)
  - Application Manager: Can create, read, and update job applications and projects (no delete)
  - Application User: Read-only access
- Login screen connected to Frappe's authentication API
- Session management using localStorage

## Installation & Setup

### Prerequisites
- Frappe Framework installed
- Node.js and npm installed
- WSL with Ubuntu (for Windows users)
- Redis database

### Setup Steps
1. Clone this repository:
```
git clone https://github.com/username/job-application-project.git
cd job-application-project
```

2. Run the setup script:
```
powershell -File setup.ps1
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

### Test Credentials

| Role          | Email               | Password    |
|---------------|---------------------|-------------|
| Administrator | admin@example.com   | admin123    |
| Application Manager  | manager@example.com | manager123  |
| Application User     | user@example.com    | user123     |

## Documentation

Detailed documentation is available in the `documentation.md` file, covering:
- Frappe Framework installation
- Custom app creation
- Role-based permissions implementation
- CRUD operations
- React frontend integration
- Challenges and solutions
- Future enhancements

## Tools & Technologies

### Backend
- Frappe Framework
- Python
- Redis
- MariaDB/MySQL

### Frontend
- React
- React Router
- React Bootstrap
- Fetch API
- React Hooks

## Screenshots

Screenshots of the application are available in the `screenshots` directory:
- Login Screen
- Job Application Dashboard
- Job Application Creation Form
- Role-based UI differences

## License

MIT

## Author

Your Name 