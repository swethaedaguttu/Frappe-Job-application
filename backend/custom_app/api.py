import frappe
from frappe import _
from frappe.utils import now, now_datetime

# ---- Task API Endpoints ----

@frappe.whitelist()
def get_tasks(status=None, project=None):
    """
    Get tasks based on filters or all tasks if no filter provided
    
    Args:
        status (str, optional): Filter tasks by status
        project (str, optional): Filter tasks by project
    """
    # Check if user has permission to view tasks
    if not frappe.has_permission("Task", "read"):
        frappe.throw(_("Not permitted to view tasks"), frappe.PermissionError)
    
    filters = {}
    if status:
        filters['status'] = status
    if project:
        filters['project'] = project

    tasks = frappe.get_all(
        'Task',
        filters=filters,
        fields=['name', 'title', 'status', 'priority', 'start_date', 'end_date', 'description', 'details', 'project']
    )

    return tasks

@frappe.whitelist()
def create_task(title, description=None, status="Open", priority="Medium", start_date=None, end_date=None, details=None, project=None):
    """
    Create a new task
    """
    # Check if user has permission to create tasks
    if not frappe.has_permission("Task", "create"):
        frappe.throw(_("Not permitted to create tasks"), frappe.PermissionError)
    
    task = frappe.new_doc("Task")
    task.title = title
    task.description = description
    task.status = status
    task.priority = priority
    task.start_date = start_date
    task.end_date = end_date
    task.details = details
    
    if project:
        # Verify the project exists and user has permission to read it
        if frappe.db.exists("Project", project):
            if frappe.has_permission("Project", "read", project):
                task.project = project
            else:
                frappe.throw(_("Not permitted to access this project"), frappe.PermissionError)
        else:
            frappe.throw(_("Project does not exist"), frappe.DoesNotExistError)
    
    task.insert()
    
    frappe.db.commit()
    
    return {
        "status": "success",
        "message": _("Task created successfully"),
        "task": {
            "name": task.name,
            "title": task.title,
            "status": task.status,
            "project": task.project
        }
    }

@frappe.whitelist()
def update_task(name, title=None, description=None, status=None, priority=None, start_date=None, end_date=None, details=None, project=None):
    """
    Update an existing task
    """
    # Check if user has permission to update tasks
    if not frappe.has_permission("Task", "write"):
        frappe.throw(_("Not permitted to update tasks"), frappe.PermissionError)
    
    task = frappe.get_doc("Task", name)
    
    # Additional check to ensure the user can modify this specific task
    if not task.has_permission("write"):
        frappe.throw(_("Not permitted to modify this task"), frappe.PermissionError)
    
    if title:
        task.title = title
    if description:
        task.description = description
    if status:
        task.status = status
    if priority:
        task.priority = priority
    if start_date:
        task.start_date = start_date
    if end_date:
        task.end_date = end_date
    if details:
        task.details = details
    
    if project:
        # Verify the project exists and user has permission
        if frappe.db.exists("Project", project):
            if frappe.has_permission("Project", "read", project):
                task.project = project
            else:
                frappe.throw(_("Not permitted to access this project"), frappe.PermissionError)
        else:
            frappe.throw(_("Project does not exist"), frappe.DoesNotExistError)
    
    task.save()
    frappe.db.commit()
    
    return {
        "status": "success",
        "message": _("Task updated successfully"),
        "task": {
            "name": task.name,
            "title": task.title,
            "status": task.status,
            "project": task.project
        }
    }

@frappe.whitelist()
def delete_task(name):
    """
    Delete a task
    """
    # Check if user has permission to delete tasks
    if not frappe.has_permission("Task", "delete"):
        frappe.throw(_("Not permitted to delete tasks"), frappe.PermissionError)
    
    task = frappe.get_doc("Task", name)
    
    # Additional check to ensure the user can delete this specific task
    if not task.has_permission("delete"):
        frappe.throw(_("Not permitted to delete this task"), frappe.PermissionError)
    
    frappe.delete_doc("Task", name)
    frappe.db.commit()
    
    return {
        "status": "success",
        "message": _("Task deleted successfully")
    }

# ---- Project API Endpoints ----

@frappe.whitelist()
def get_projects(status=None):
    """
    Get projects based on status filter or all projects if no filter provided
    """
    # Check if user has permission to view projects
    if not frappe.has_permission("Project", "read"):
        frappe.throw(_("Not permitted to view projects"), frappe.PermissionError)
    
    filters = {}
    if status:
        filters['status'] = status

    projects = frappe.get_all(
        'Project',
        filters=filters,
        fields=['name', 'title', 'status', 'start_date', 'end_date', 'description']
    )

    # Add task count to projects
    for project in projects:
        project_doc = frappe.get_doc("Project", project.name)
        project['task_count'] = len(project_doc.tasks) if project_doc.tasks else 0
        
        # Calculate progress percentage
        if project_doc.tasks:
            completed = sum(1 for task in project_doc.tasks if frappe.get_value("Task", task.task, "status") == "Completed")
            project['progress'] = (completed / len(project_doc.tasks)) * 100
        else:
            project['progress'] = 0

    return projects

@frappe.whitelist()
def create_project(title, description=None, status="Planning", start_date=None, end_date=None, tasks=None):
    """
    Create a new project
    """
    # Check if user has permission to create projects
    if not frappe.has_permission("Project", "create"):
        frappe.throw(_("Not permitted to create projects"), frappe.PermissionError)
    
    project = frappe.new_doc("Project")
    project.title = title
    project.description = description
    project.status = status
    project.start_date = start_date
    project.end_date = end_date
    
    # Add tasks if provided
    if tasks and isinstance(tasks, list):
        for task_id in tasks:
            if frappe.db.exists("Task", task_id):
                task = frappe.get_doc("Task", task_id)
                project.append("tasks", {
                    "task": task.name,
                    "task_title": task.title,
                    "status": task.status,
                    "priority": task.priority,
                    "start_date": task.start_date,
                    "end_date": task.end_date
                })
    
    project.insert()
    frappe.db.commit()
    
    return {
        "status": "success",
        "message": _("Project created successfully"),
        "project": {
            "name": project.name,
            "title": project.title,
            "status": project.status
        }
    }

@frappe.whitelist()
def update_project(name, title=None, description=None, status=None, start_date=None, end_date=None):
    """
    Update an existing project
    """
    # Check if user has permission to update projects
    if not frappe.has_permission("Project", "write"):
        frappe.throw(_("Not permitted to update projects"), frappe.PermissionError)
    
    project = frappe.get_doc("Project", name)
    
    # Additional check to ensure the user can modify this specific project
    if not project.has_permission("write"):
        frappe.throw(_("Not permitted to modify this project"), frappe.PermissionError)
    
    if title:
        project.title = title
    if description:
        project.description = description
    if status:
        project.status = status
    if start_date:
        project.start_date = start_date
    if end_date:
        project.end_date = end_date
    
    project.save()
    frappe.db.commit()
    
    return {
        "status": "success",
        "message": _("Project updated successfully"),
        "project": {
            "name": project.name,
            "title": project.title,
            "status": project.status
        }
    }

@frappe.whitelist()
def delete_project(name):
    """
    Delete a project
    """
    # Check if user has permission to delete projects
    if not frappe.has_permission("Project", "delete"):
        frappe.throw(_("Not permitted to delete projects"), frappe.PermissionError)
    
    project = frappe.get_doc("Project", name)
    
    # Additional check to ensure the user can delete this specific project
    if not project.has_permission("delete"):
        frappe.throw(_("Not permitted to delete this project"), frappe.PermissionError)
    
    frappe.delete_doc("Project", name)
    frappe.db.commit()
    
    return {
        "status": "success",
        "message": _("Project deleted successfully")
    }

@frappe.whitelist()
def add_task_to_project(project, task):
    """
    Add a task to a project
    """
    # Check permissions
    if not frappe.has_permission("Project", "write"):
        frappe.throw(_("Not permitted to modify projects"), frappe.PermissionError)
    
    if not frappe.has_permission("Task", "read"):
        frappe.throw(_("Not permitted to read tasks"), frappe.PermissionError)
    
    # Get the project and task
    project_doc = frappe.get_doc("Project", project)
    task_doc = frappe.get_doc("Task", task)
    
    # Check if task already exists in project
    task_exists = False
    for task_link in project_doc.tasks:
        if task_link.task == task:
            task_exists = True
            break
    
    if not task_exists:
        # Add task to project
        project_doc.append("tasks", {
            "task": task_doc.name,
            "task_title": task_doc.title,
            "status": task_doc.status,
            "priority": task_doc.priority,
            "start_date": task_doc.start_date,
            "end_date": task_doc.end_date
        })
        
        project_doc.save()
        
        # Update task to reference project
        task_doc.project = project
        task_doc.save()
        
        frappe.db.commit()
        
        return {
            "status": "success",
            "message": _("Task added to project successfully")
        }
    else:
        return {
            "status": "info",
            "message": _("Task is already part of the project")
        }

@frappe.whitelist()
def remove_task_from_project(project, task):
    """
    Remove a task from a project
    """
    # Check permissions
    if not frappe.has_permission("Project", "write"):
        frappe.throw(_("Not permitted to modify projects"), frappe.PermissionError)
    
    # Get the project and task
    project_doc = frappe.get_doc("Project", project)
    
    # Find and remove task
    for i, task_link in enumerate(project_doc.tasks):
        if task_link.task == task:
            project_doc.tasks.pop(i)
            project_doc.save()
            
            # Update task to remove project reference
            task_doc = frappe.get_doc("Task", task)
            task_doc.project = None
            task_doc.save()
            
            frappe.db.commit()
            
            return {
                "status": "success",
                "message": _("Task removed from project successfully")
            }
    
    return {
        "status": "info",
        "message": _("Task is not part of the project")
    }

# ---- Direct API Endpoints ----

@frappe.whitelist(allow_guest=True)
def handle_options_request():
    """Handle OPTIONS requests for CORS preflight"""
    if frappe.request and frappe.request.method == "OPTIONS":
        frappe.local.response["http_status_code"] = 200
        frappe.local.response["message"] = "OK"
        
        # Set CORS headers
        set_cors_headers()
        
        # Skip further processing
        frappe.flags.finish_request = True

@frappe.whitelist(allow_guest=True)
def set_cors_headers():
    """Set CORS headers for all responses"""
    if not frappe.local.response.headers:
        frappe.local.response.headers = {}
    
    # Allow requests from React frontend
    frappe.local.response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    frappe.local.response.headers["Access-Control-Allow-Credentials"] = "true"
    frappe.local.response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    frappe.local.response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"

# Direct API endpoint for projects
@frappe.whitelist()
def api_projects():
    """Direct API endpoint for projects"""
    # Handle different HTTP methods
    if frappe.request.method == "GET":
        # Get status filter from query string if present
        status = frappe.request.args.get('status') if frappe.request.args else None
        return get_projects(status)
    elif frappe.request.method == "POST":
        # Parse request data
        data = frappe.request.get_json()
        return create_project(
            title=data.get('title'),
            description=data.get('description'),
            status=data.get('status', 'Planning'),
            start_date=data.get('start_date'),
            end_date=data.get('end_date'),
            tasks=data.get('tasks')
        )
    elif frappe.request.method == "PUT":
        # Parse request data
        data = frappe.request.get_json()
        return update_project(
            name=data.get('name'),
            title=data.get('title'),
            description=data.get('description'),
            status=data.get('status'),
            start_date=data.get('start_date'),
            end_date=data.get('end_date')
        )
    elif frappe.request.method == "DELETE":
        # Parse request data
        data = frappe.request.get_json()
        return delete_project(name=data.get('name'))

# Direct API endpoint for tasks
@frappe.whitelist()
def api_tasks():
    """Direct API endpoint for tasks"""
    # Handle different HTTP methods
    if frappe.request.method == "GET":
        # Get filters from query string if present
        status = frappe.request.args.get('status') if frappe.request.args else None
        project = frappe.request.args.get('project') if frappe.request.args else None
        return get_tasks(status, project)
    elif frappe.request.method == "POST":
        # Parse request data
        data = frappe.request.get_json()
        return create_task(
            title=data.get('title'),
            description=data.get('description'),
            status=data.get('status', 'Open'),
            priority=data.get('priority', 'Medium'),
            start_date=data.get('start_date'),
            end_date=data.get('end_date'),
            details=data.get('details'),
            project=data.get('project')
        )
    elif frappe.request.method == "PUT":
        # Parse request data
        data = frappe.request.get_json()
        return update_task(
            name=data.get('name'),
            title=data.get('title'),
            description=data.get('description'),
            status=data.get('status'),
            priority=data.get('priority'),
            start_date=data.get('start_date'),
            end_date=data.get('end_date'),
            details=data.get('details'),
            project=data.get('project')
        )
    elif frappe.request.method == "DELETE":
        # Parse request data
        data = frappe.request.get_json()
        return delete_task(name=data.get('name'))

# Direct API endpoint for project tasks
@frappe.whitelist()
def api_project_tasks(project_id=None):
    """API endpoint for project tasks"""
    if not project_id:
        # Try to get project ID from request URL
        # Parse from something like /api/projects/PROJECT-123/tasks
        path_parts = frappe.request.path.split('/')
        if len(path_parts) >= 4 and path_parts[2] == 'projects':
            project_id = path_parts[3]
    
    # Handle different HTTP methods
    if frappe.request.method == "GET":
        # Return tasks for the project
        return get_tasks(project=project_id)
    
    elif frappe.request.method == "POST":
        # Add task to project
        data = frappe.request.get_json()
        task_id = data.get('task')
        
        if not task_id:
            return {
                "status": "error",
                "message": "Task ID is required"
            }
        
        return add_task_to_project(project=project_id, task=task_id)
    
    elif frappe.request.method == "DELETE":
        # Remove task from project
        data = frappe.request.get_json()
        task_id = data.get('task')
        
        if not task_id:
            return {
                "status": "error",
                "message": "Task ID is required"
            }
        
        return remove_task_from_project(project=project_id, task=task_id)

@frappe.whitelist()
def get_job_applications(status=None):
    """
    Get list of job applications with optional status filter
    """
    try:
        filters = {}
        if status:
            filters['status'] = status
            
        job_applications = frappe.get_all(
            "Job Application",
            filters=filters,
            fields=["name", "job_title", "applicant_name", "email_id", "status", 
                   "department", "application_date", "resume_attachment", "skills"]
        )
        
        # Format data to match frontend expectations
        formatted_applications = []
        for app in job_applications:
            formatted_applications.append({
                "name": app.name,
                "title": app.job_title,
                "applicant_name": app.applicant_name,
                "email": app.email_id,
                "status": app.status,
                "position": app.job_title,
                "department": app.department,
                "apply_date": app.application_date,
                "resume_link": app.resume_attachment,
                "skills": app.skills or ""
            })
        
        return formatted_applications
    except Exception as e:
        frappe.log_error(title="Error in get_job_applications", message=str(e))
        return {"error": str(e)}

@frappe.whitelist()
def create_job_application(title, applicant_name, email, status, position, department, 
                       apply_date=None, resume_link=None, experience=None, skills=None):
    """
    Create a new job application
    """
    try:
        doc = frappe.new_doc("Job Application")
        doc.job_title = title
        doc.applicant_name = applicant_name
        doc.email_id = email
        doc.status = status
        doc.department = department
        doc.application_date = apply_date or now_datetime().date()
        
        if resume_link:
            doc.resume_attachment = resume_link
        if experience:
            doc.custom_experience = experience
        if skills:
            doc.skills = skills
            
        doc.insert(ignore_permissions=True)
        
        return {
            "status": "success",
            "message": "Job application created successfully",
            "application": {
                "name": doc.name,
                "title": doc.job_title,
                "applicant_name": doc.applicant_name,
                "status": doc.status
            }
        }
    except Exception as e:
        frappe.log_error(title="Error in create_job_application", message=str(e))
        return {"error": str(e)}

@frappe.whitelist()
def update_job_application(name, title, applicant_name, email, status, position=None, department=None, 
                       apply_date=None, resume_link=None, experience=None, skills=None):
    """
    Update an existing job application
    """
    try:
        doc = frappe.get_doc("Job Application", name)
        doc.job_title = title
        doc.applicant_name = applicant_name
        doc.email_id = email
        doc.status = status
        
        if department:
            doc.department = department
        if apply_date:
            doc.application_date = apply_date
        if resume_link:
            doc.resume_attachment = resume_link
        if experience:
            doc.custom_experience = experience
        if skills:
            doc.skills = skills
            
        doc.save(ignore_permissions=True)
        
        return {
            "status": "success",
            "message": "Job application updated successfully",
            "application": {
                "name": doc.name,
                "title": doc.job_title,
                "applicant_name": doc.applicant_name,
                "status": doc.status
            }
        }
    except Exception as e:
        frappe.log_error(title="Error in update_job_application", message=str(e))
        return {"error": str(e)}

@frappe.whitelist()
def delete_job_application(name):
    """
    Delete a job application
    """
    try:
        frappe.delete_doc("Job Application", name, ignore_permissions=True)
        
        return {
            "status": "success",
            "message": "Job application deleted successfully"
        }
    except Exception as e:
        frappe.log_error(title="Error in delete_job_application", message=str(e))
        return {"error": str(e)}
 