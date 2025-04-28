# Frappe Framework Task Management Application Documentation

## 1. Frappe Framework Installation

### Installation Steps
1. Install the required dependencies for Frappe:
   - Python 3.7+
   - Node.js
   - MariaDB/MySQL
   - Redis

2. Install Frappe bench:
   ```
   pip install frappe-bench
   ```

3. Initialize a new bench:
   ```
   bench init frappe-bench
   cd frappe-bench
   ```

4. Create a new site:
   ```
   bench new-site task-management.local
   bench use task-management.local
   ```

5. Get and install Frappe:
   ```
   bench get-app frappe
   bench install-app frappe
   ```

6. Start the Frappe server:
   ```
   bench start
   ```

## 2. Custom App Creation

### App Structure
The custom app is structured as follows:
```
custom_app/
├── __init__.py
├── api.py
├── middleware.py
├── setup_roles.py
├── config/
│   ├── __init__.py
│   └── desktop.py
├── hooks.py
├── task_management/
│   ├── __init__.py
│   └── doctype/
│       ├── project/
│       │   ├── __init__.py
│       │   ├── project.py
│       │   ├── project.json
│       │   └── project_list.js
│       ├── project_task/
│       │   ├── __init__.py
│       │   └── project_task.json
│       └── task/
│           ├── __init__.py
│           ├── task.py
│           ├── task.json
│           └── task_list.js
```

### DocType Creation
Two main DocTypes were implemented:

#### Task DocType
The Task DocType includes the following fields:
- Title (Data): Required field for the task name
- Description (Text Editor): Rich text field for detailed task description
- Status (Select): Options include Open, In Progress, Completed, and Cancelled
- Priority (Select): Options include Low, Medium, and High
- Start Date (Date): Date when the task should start
- End Date (Date): Deadline for the task
- Project (Link): Reference to the Project DocType
- Additional Details (Long Text): Extra information about the task

#### Project DocType
The Project DocType includes the following fields:
- Title (Data): Required field for the project name
- Description (Text Editor): Rich text field for project description
- Status (Select): Options include Planning, Active, Completed, and Cancelled
- Start Date (Date): Date when the project should start
- End Date (Date): Deadline for the project
- Tasks (Table): A child table to link tasks to the project

The Project Task child table creates a many-to-many relationship between Projects and Tasks, allowing a task to be part of a project while maintaining its own record.

### DocType Definition
The JSON definition files (task.json and project.json) define the structure and properties of the DocTypes including:
- Fields with their properties (type, label, options)
- Form layout (sections, columns)
- Permissions for different user roles
- Sorting and filtering options

## 3. Role-Based Permissions Implementation

### Role Definitions
Three custom roles were implemented for the application:
1. **Administrator/System Manager:**
   - Full control (create, read, update, delete) for Tasks and Projects
   - Can manage users and roles
   - Access to system settings

2. **Task Manager:**
   - Can create, read, and update Tasks and Projects
   - Cannot delete Tasks or Projects
   - Can export and share Tasks and Projects
   - Can add/remove Tasks from Projects

3. **Task User:**
   - Read-only access to Tasks and Projects
   - Can export Tasks and Projects for reporting
   - Cannot create, update, or delete Tasks or Projects

### Permission Configuration
Permissions are configured in multiple layers:
1. **DocType Level:** Both Task and Project DocTypes have role-based permissions defined in their JSON files
2. **API Level:** All API endpoints check user permissions before performing operations
3. **Frontend Level:** UI elements (edit/delete buttons) are shown or hidden based on user roles

### User Management
A setup script (setup_roles.py) was created to:
- Create the necessary roles if they don't exist
- Create test users with appropriate roles:
  - admin@example.com (Administrator)
  - manager@example.com (Task Manager)
  - user@example.com (Task User)

## 4. Basic Functionality Implementation

### CRUD Operations
CRUD operations are implemented using Frappe's standard methods:
- Create: Using `frappe.new_doc` and `doc.insert()`
- Read: Using `frappe.get_doc` and `frappe.get_all`
- Update: Using `doc.update` and `doc.save()`
- Delete: Using `frappe.delete_doc`

These operations are exposed through custom API endpoints defined in `api.py`.

### API Endpoints
The following API endpoints were implemented:

#### Task Endpoints
- `get_tasks`: Retrieve tasks with optional status and project filtering
- `create_task`: Create a new task with validation
- `update_task`: Update an existing task with permission checks
- `delete_task`: Delete a task with permission checks

#### Project Endpoints
- `get_projects`: Retrieve projects with optional status filtering
- `create_project`: Create a new project with validation
- `update_project`: Update an existing project with permission checks
- `delete_project`: Delete a project with permission checks
- `add_task_to_project`: Add a task to a project
- `remove_task_from_project`: Remove a task from a project

### List View
Custom list views have been implemented to display tasks and projects with visual indicators for status and priority. The list views allow:
- Sorting by various fields
- Visual indicators for different statuses
- Quick access to edit and delete actions (based on user permissions)

## 5. React Login Screen Integration

### Integration with Frappe API
The React frontend connects to Frappe's authentication API using the following:
- Fetch API for API requests
- `/api/method/login` endpoint for authentication

### Authentication Flow
1. User enters credentials (username/email and password)
2. Frontend sends credentials to Frappe's login endpoint
3. Upon successful authentication, Frappe sets cookies and returns success
4. Frontend stores authentication state in localStorage
5. Subsequent API requests include the authentication cookies

### Role-Based UI
The frontend adapts the user interface based on the user's role:
- Administrators see all buttons and features
- Task Managers see create and edit buttons, but not delete
- Regular Users only see the task list without edit controls

### React Components
The frontend application consists of several key components:
- **Login.js**: Handles user authentication
- **Dashboard.js**: Displays tasks with role-based UI elements
- **TaskForm.js**: Form for creating/editing tasks with permission checks
- **NavBar.js**: Navigation bar with user information and logout button
- **App.js**: Main component with route protection based on user roles

## 6. Challenges and Solutions

### Challenge 1: CORS Configuration
**Challenge**: Configuring Cross-Origin Resource Sharing (CORS) between the Frappe backend and React frontend.

**Solution**: Created a comprehensive CORS solution with multiple layers of protection:
1. Custom middleware (`middleware.py`) to handle CORS headers and preflight requests
2. Two separate middleware functions:
   - `setup_cors()`: Runs before request processing to handle OPTIONS requests and set initial headers
   - `add_cors_headers()`: Runs after request processing to ensure headers are present in the response
3. Multiple API endpoint styles (method-based and direct REST) to provide fallback options
4. Configuration in site_config.json and through bench commands to set allow_cors and cors_domains
5. Frontend error handling with graceful fallback to demo data when server connection fails

The CORS middleware adds appropriate headers to all responses:
```python
frappe.local.response.headers["Access-Control-Allow-Origin"] = origin
frappe.local.response.headers["Access-Control-Allow-Credentials"] = "true"
frappe.local.response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
frappe.local.response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept, Origin, If-None-Match"
frappe.local.response.headers["Access-Control-Max-Age"] = "3600"
```

The restart script also updates CORS settings on each restart to ensure they're properly configured:
```powershell
wsl -d Ubuntu -e bash -c "cd ~/frappe-project/frappe-bench && source ~/frappe-env/bin/activate && bench --site task-management.local set-config allow_cors 1"
wsl -d Ubuntu -e bash -c "cd ~/frappe-project/frappe-bench && source ~/frappe-env/bin/activate && bench --site task-management.local set-config cors_domains '[\"http://localhost:3000\", \"http://127.0.0.1:3000\"]'"
```

### Challenge 2: Redis Port Conflicts
**Challenge**: Redis port conflicts causing the Frappe server to fail to start.

**Solution**: Created custom Redis configuration files to use different ports (12000 and 14000) instead of the default ports. Implemented a robust restart script that kills existing processes and checks port availability before starting services.

### Challenge 3: Role-Based Permissions
**Challenge**: Implementing consistent role-based permissions across backend and frontend.

**Solution**: 
- Created a comprehensive permission system in the backend that checks permissions at the DocType level and in API endpoints
- Implemented role-based UI in the frontend that adapts based on the user's role
- Added route protection in React to prevent unauthorized access to sensitive routes

### Challenge 4: API Fallback Mechanism
**Challenge**: Ensuring the frontend works even when the backend is unavailable.

**Solution**: Implemented fallback mechanisms in all API endpoints that return demo data when the server is unreachable. This allows the application to function in a degraded mode with sample data rather than failing completely.

## 7. Future Enhancements

### Possible Improvements
1. **Task Assignment**: Add the ability to assign tasks to specific users
2. **Project Management**: Group tasks into projects for better organization
3. **Email Notifications**: Send notifications when tasks are created or updated
4. **File Attachments**: Allow file uploads for tasks
5. **Task Dependencies**: Create relationships between tasks
6. **Calendar View**: Add a calendar view to visualize task timelines
7. **Mobile Optimization**: Improve the UI for mobile devices
8. **Task Templates**: Create reusable templates for common tasks

## 8. Running the Application

### Prerequisites
- Frappe Framework installed
- Node.js and npm installed
- Custom app installed in Frappe

### Setup Steps
1. Run the setup script to create roles and users:
   ```
   powershell -File setup.ps1
   ```

2. Access the application:
   - Backend: http://localhost:8000
   - Frontend: http://localhost:3000

3. Login with one of the test users:
   - Administrator: admin@example.com / admin123
   - Task Manager: manager@example.com / manager123
   - Regular User: user@example.com / user123

## 9. Conclusion

This project successfully demonstrates the integration of Frappe Framework with a React frontend to create a functional task management application. The implementation includes:

- A custom DocType with appropriate fields and permissions
- Complete CRUD operations through custom API endpoints
- Role-based access control with three distinct roles
- A React frontend with authentication against Frappe's API
- A clean, user-friendly interface for managing tasks

The application showcases the power of using Frappe as a backend framework combined with a modern React frontend to create a robust and scalable business application. 