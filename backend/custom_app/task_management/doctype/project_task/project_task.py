import frappe
from frappe.model.document import Document

class ProjectTask(Document):
    def validate(self):
        """Validate that the referenced task exists"""
        if self.task:
            task_exists = frappe.db.exists("Task", self.task)
            if not task_exists:
                frappe.throw(f"Task {self.task} does not exist")
    
    def on_update(self):
        """Refresh task data when project task is updated"""
        if self.task:
            task = frappe.get_doc("Task", self.task)
            
            # Update fields from task
            self.task_title = task.title
            self.status = task.status
            self.priority = task.priority
            self.start_date = task.start_date
            self.end_date = task.end_date 