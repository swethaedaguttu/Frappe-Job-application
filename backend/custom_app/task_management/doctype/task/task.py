import frappe
from frappe.model.document import Document

class Task(Document):
    def validate(self):
        self.validate_dates()
        self.validate_status()
        
    def validate_dates(self):
        """Validate start and end dates"""
        if self.start_date and self.end_date and self.start_date > self.end_date:
            frappe.throw("End Date cannot be before Start Date")
    
    def validate_status(self):
        """Validate status transitions"""
        if not self.get_doc_before_save():
            return
            
        old_status = self.get_doc_before_save().status
        new_status = self.status
        
        # Prevent completed tasks from being reopened directly
        if old_status == "Completed" and new_status in ["Open", "In Progress"]:
            frappe.msgprint("Note: You are reopening a completed task.")
    
    def update_project_if_linked(self):
        """Update project if task is linked to one"""
        if self.project:
            project = frappe.get_doc("Project", self.project)
            
            # Check if task is already linked to project
            task_exists = False
            for task in project.tasks:
                if task.task == self.name:
                    task_exists = True
                    break
                    
            # If task not linked, add it to project
            if not task_exists:
                project.append("tasks", {
                    "task": self.name,
                    "task_title": self.title,
                    "status": self.status,
                    "priority": self.priority,
                    "start_date": self.start_date,
                    "end_date": self.end_date
                })
                project.save(ignore_permissions=True)
            
            # If task is linked and status has changed, update project
            elif self.has_value_changed("status") or self.has_value_changed("start_date") or self.has_value_changed("end_date"):
                project.save(ignore_permissions=True)
    
    def on_update(self):
        self.update_project_if_linked() 