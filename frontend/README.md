# Task Management - React Frontend

This is the React frontend for the Task Management application, which connects to a Frappe backend.

## Requirements

- Node.js (v14+)
- React (v18)
- A running Frappe backend instance

## Installation

1. Install dependencies:
```
npm install
```

2. Start the development server:
```
npm start
```

3. Access the application at http://localhost:3000

## Features

- User authentication with Frappe backend
- Task management dashboard:
  - View all tasks with filtering options
  - Create new tasks
  - Edit existing tasks
  - Delete tasks
- Task details including:
  - Title
  - Description
  - Status (Open, In Progress, Completed, Cancelled)
  - Priority (Low, Medium, High)
  - Start and End dates
  - Additional details

## Project Structure

- `src/`
  - `components/`: React components for the application
    - `Login.js`: Login screen with Frappe authentication
    - `NavBar.js`: Navigation bar with user info and logout
    - `Dashboard.js`: Main dashboard for viewing tasks
    - `TaskForm.js`: Form for creating/editing tasks
  - `services/`
    - `api.js`: API service for communicating with the Frappe backend
  - `App.js`: Main application component with routing
  - `index.js`: Entry point for the React application

## Authentication

The application uses Frappe's standard authentication API:
- `/api/method/login` for user login
- `/api/method/logout` for user logout

## API Endpoints

The frontend communicates with the following Frappe API endpoints:
- `custom_app.api.get_tasks`: Get all tasks
- `custom_app.api.create_task`: Create a new task
- `custom_app.api.update_task`: Update an existing task
- `custom_app.api.delete_task`: Delete a task 