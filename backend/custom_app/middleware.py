import frappe
import json
from werkzeug.wrappers import Response

def setup_cors():
    """
    Setup CORS headers for all responses
    """
    # Skip if this is a request that doesn't need CORS handling
    if not frappe.request:
        return

    # Get domain from request origin
    origin = frappe.request.headers.get('Origin', '')
    allowed_origins = ['http://localhost:3000', 'http://127.0.0.1:3000']
    
    # Only set headers if the origin is allowed
    if origin in allowed_origins:
        # Create headers if they don't exist
        if not hasattr(frappe.local.response, 'headers'):
            frappe.local.response.headers = {}
        
        # Set CORS headers
        frappe.local.response.headers["Access-Control-Allow-Origin"] = origin
        frappe.local.response.headers["Access-Control-Allow-Credentials"] = "true"
        frappe.local.response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        frappe.local.response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept, Origin, If-None-Match"
        frappe.local.response.headers["Access-Control-Max-Age"] = "3600"
    
    # Handle OPTIONS requests directly
    if frappe.request.method == "OPTIONS":
        if not frappe.local.response:
            frappe.local.response = Response()

        # Set success response for preflight request
        if not hasattr(frappe.local.response, 'data'):
            frappe.local.response.data = json.dumps({"message": "success"})
            
        # Set status code
        frappe.local.response.status_code = 200

        # Skip further processing
        frappe.flags.finish_request = True
        return

def add_cors_headers():
    """
    Add CORS headers to all API responses, called at the end of each request
    """
    if not hasattr(frappe.local, 'response'):
        return
    
    if not hasattr(frappe.local.response, 'headers'):
        frappe.local.response.headers = {}
    
    # Get domain from request origin
    origin = frappe.request.headers.get('Origin', '') if frappe.request else ''
    allowed_origins = ['http://localhost:3000', 'http://127.0.0.1:3000']
    
    # Only set headers if the origin is allowed
    if origin in allowed_origins:
        frappe.local.response.headers["Access-Control-Allow-Origin"] = origin
        frappe.local.response.headers["Access-Control-Allow-Credentials"] = "true"
        frappe.local.response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        frappe.local.response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept, Origin, If-None-Match" 