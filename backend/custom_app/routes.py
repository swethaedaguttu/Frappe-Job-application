import frappe
from . import api

def register_api_routes():
    """
    Register custom API routes using Frappe's API decorator
    """
    # We'll use Frappe's whitelisted methods instead of create_endpoint
    # The routes below will be registered in __init__.py
    pass

# Direct API routes - we'll register these using the @frappe.whitelist() decorator
# These will be available at /api/method/custom_app.routes.<method_name>
@frappe.whitelist(allow_guest=True)
def projects():
    """Projects API endpoint"""
    # Get method type
    method = frappe.local.request.method
    
    # If it's GET, return all projects or filtered by status
    if method == "GET":
        status = frappe.form_dict.get('status')
        return api.get_projects(status=status)
    
    # If it's POST, create a new project
    elif method == "POST":
        data = frappe.request.get_json()
        return api.create_project(
            title=data.get('title'),
            description=data.get('description'),
            status=data.get('status', 'Planning'),
            start_date=data.get('start_date'),
            end_date=data.get('end_date'),
            tasks=data.get('tasks')
        )
    
    # If it's PUT, update an existing project
    elif method == "PUT":
        data = frappe.request.get_json()
        return api.update_project(
            name=data.get('name'),
            title=data.get('title'),
            description=data.get('description'),
            status=data.get('status'),
            start_date=data.get('start_date'),
            end_date=data.get('end_date')
        )
    
    # If it's DELETE, delete a project
    elif method == "DELETE":
        data = frappe.request.get_json()
        return api.delete_project(name=data.get('name'))
    
    # Default response for unsupported methods
    return {
        "status": "error",
        "message": "Method not supported"
    }

@frappe.whitelist(allow_guest=True)
def tasks():
    """Tasks API endpoint"""
    # Get method type
    method = frappe.local.request.method
    
    # If it's GET, return all tasks or filtered
    if method == "GET":
        status = frappe.form_dict.get('status')
        project = frappe.form_dict.get('project')
        return api.get_tasks(status=status, project=project)
    
    # If it's POST, create a new task
    elif method == "POST":
        data = frappe.request.get_json()
        return api.create_task(
            title=data.get('title'),
            description=data.get('description'),
            status=data.get('status', 'Open'),
            priority=data.get('priority', 'Medium'),
            start_date=data.get('start_date'),
            end_date=data.get('end_date'),
            details=data.get('details'),
            project=data.get('project')
        )
    
    # If it's PUT, update an existing task
    elif method == "PUT":
        data = frappe.request.get_json()
        return api.update_task(
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
    
    # If it's DELETE, delete a task
    elif method == "DELETE":
        data = frappe.request.get_json()
        return api.delete_task(name=data.get('name'))
    
    # Default response for unsupported methods
    return {
        "status": "error",
        "message": "Method not supported"
    }

@frappe.whitelist(allow_guest=True)
def project_tasks(project_id=None):
    """Project tasks API endpoint"""
    # Get method type
    method = frappe.local.request.method
    
    # If it's GET, return tasks for project
    if method == "GET":
        return api.get_tasks(project=project_id)
    
    # If it's POST, handle task addition or removal
    elif method == "POST":
        # Get request data
        data = frappe.request.get_json()
        task_id = data.get('task')
        action = data.get('action', 'add')  # Default to add
        
        if action == 'remove':
            return api.remove_task_from_project(project=project_id, task=task_id)
        else:
            return api.add_task_to_project(project=project_id, task=task_id)
    
    # Default response for unsupported methods
    return {
        "status": "error",
        "message": "Method not supported"
    } 