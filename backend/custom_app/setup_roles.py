import frappe

def setup_roles_and_permissions():
    """
    Set up roles and permissions for the Task Management app
    """
    print("Setting up roles and permissions for Task Management...")
    
    # Create roles if they don't exist
    create_role_if_not_exists("Task Manager")
    create_role_if_not_exists("Task User")
    
    # Create test users with different roles
    create_test_users()
    
    print("Setup completed successfully!")

def create_role_if_not_exists(role_name):
    """Create a role if it doesn't already exist"""
    if not frappe.db.exists("Role", role_name):
        role = frappe.new_doc("Role")
        role.role_name = role_name
        role.desk_access = 1
        role.insert(ignore_permissions=True)
        print(f"Created role: {role_name}")
    else:
        print(f"Role {role_name} already exists")

def create_test_users():
    """Create test users with different roles"""
    # Create admin user if not exists
    if not frappe.db.exists("User", "admin@example.com"):
        user = frappe.new_doc("User")
        user.email = "admin@example.com"
        user.first_name = "Admin"
        user.last_name = "User"
        user.new_password = "admin123"
        user.send_welcome_email = 0
        user.user_type = "System User"
        user.append("roles", {"role": "Administrator"})
        user.append("roles", {"role": "System Manager"})
        user.insert(ignore_permissions=True)
        print("Created admin user: admin@example.com")
    
    # Create task manager user if not exists
    if not frappe.db.exists("User", "manager@example.com"):
        user = frappe.new_doc("User")
        user.email = "manager@example.com"
        user.first_name = "Task"
        user.last_name = "Manager"
        user.new_password = "manager123"
        user.send_welcome_email = 0
        user.user_type = "System User"
        user.append("roles", {"role": "Task Manager"})
        user.insert(ignore_permissions=True)
        print("Created manager user: manager@example.com")
    
    # Create regular user if not exists
    if not frappe.db.exists("User", "user@example.com"):
        user = frappe.new_doc("User")
        user.email = "user@example.com"
        user.first_name = "Regular"
        user.last_name = "User"
        user.new_password = "user123"
        user.send_welcome_email = 0
        user.user_type = "System User"
        user.append("roles", {"role": "Task User"})
        user.insert(ignore_permissions=True)
        print("Created regular user: user@example.com")

def execute():
    """Main execution function"""
    setup_roles_and_permissions()

if __name__ == "__main__":
    execute() 