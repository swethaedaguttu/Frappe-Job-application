import frappe
from frappe.model.document import Document

class Project(Document):
    def validate(self):
        self.update_project_status()
        self.update_project_dates()
    
    def update_project_status(self):
        """Update project status based on tasks"""
        if not self.tasks:
            return
        
        completed_tasks = 0
        total_tasks = len(self.tasks)
        
        for task_link in self.tasks:
            task = frappe.get_doc("Task", task_link.task)
            if task.status == "Completed":
                completed_tasks += 1
        
        # Auto-update project status based on task completion
        if total_tasks == completed_tasks and total_tasks > 0:
            self.status = "Completed"
        elif completed_tasks > 0:
            self.status = "Active"
    
    def update_project_dates(self):
        """Update project start and end dates based on tasks"""
        if not self.tasks:
            return
        
        # Initialize with None to find min/max dates
        earliest_start = None
        latest_end = None
        
        for task_link in self.tasks:
            task = frappe.get_doc("Task", task_link.task)
            
            if task.start_date:
                if not earliest_start or task.start_date < earliest_start:
                    earliest_start = task.start_date
            
            if task.end_date:
                if not latest_end or task.end_date > latest_end:
                    latest_end = task.end_date
        
        # Update project dates if found
        if earliest_start and (not self.start_date or self.start_date > earliest_start):
            self.start_date = earliest_start
            
        if latest_end and (not self.end_date or self.end_date < latest_end):
            self.end_date = latest_end 