# Task Management - Frappe Backend

This is a custom Frappe app that implements a simple task management system.

## Installation

1. Install Frappe bench:
```
pip install frappe-bench
```

2. Initialize a new bench:
```
bench init frappe-bench
cd frappe-bench
```

3. Add the app to your bench:
```
bench get-app custom_app https://github.com/yourusername/custom_app
# or copy the custom_app folder to frappe-bench/apps/
```

4. Install the app on your site:
```
bench --site your-site.local install-app custom_app
```

## Features

- Task DocType with the following fields:
  - Title
  - Description
  - Status (Open, In Progress, Completed, Cancelled)
  - Start Date
  - End Date
  - Priority (Low, Medium, High)
  - Additional Details

- Role-based permissions:
  - System Manager: Full control
  - Task Manager: Create, read, update tasks
  - Task User: Read-only access

- API endpoints for:
  - Getting all tasks
  - Creating a new task
  - Updating a task
  - Deleting a task

## Usage

Start the Frappe server:
```
bench start
```

Access the server at http://localhost:8000

## API Documentation

### Get Tasks
```
GET /api/method/custom_app.api.get_tasks
```

### Create Task
```
POST /api/method/custom_app.api.create_task
```

### Update Task
```
POST /api/method/custom_app.api.update_task
```

### Delete Task
```
POST /api/method/custom_app.api.delete_task
``` 