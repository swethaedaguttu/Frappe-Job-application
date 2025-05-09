app_name = "custom_app"
app_title = "Task Management"
app_publisher = "Developer"
app_description = "A Frappe Task Management Application"
app_icon = "octicon octicon-file-directory"
app_color = "grey"
app_email = "developer@example.com"
app_license = "MIT"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/custom_app/css/custom_app.css"
app_include_js = "/assets/js/custom_app.min.js"
app_include_css = "/assets/css/custom_app.min.css"

# include js, css files in header of web template
# web_include_css = "/assets/custom_app/css/custom_app.css"
# web_include_js = "/assets/custom_app/js/custom_app.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "custom_app/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "custom_app.install.before_install"
# after_install = "custom_app.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "custom_app.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
#	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"custom_app.tasks.all"
# 	],
# 	"daily": [
# 		"custom_app.tasks.daily"
# 	],
# 	"hourly": [
# 		"custom_app.tasks.hourly"
# 	],
# 	"weekly": [
# 		"custom_app.tasks.weekly"
# 	]
# 	"monthly": [
# 		"custom_app.tasks.monthly"
# 	]
# }

# Testing
# -------

# before_tests = "custom_app.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "custom_app.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "custom_app.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]


# User Data Protection
# --------------------

user_data_fields = [
	{
		"doctype": "{doctype_1}",
		"filter_by": "{filter_by}",
		"redact_fields": ["{field_1}", "{field_2}"],
		"partial": 1,
	},
	{
		"doctype": "{doctype_2}",
		"filter_by": "{filter_by}",
		"partial": 1,
	},
	{
		"doctype": "{doctype_3}",
		"strict": False,
	},
	{
		"doctype": "{doctype_4}"
	}
]

# CORS settings
cors_domains = ["http://localhost:3000", "http://127.0.0.1:3000"]

# Add hooks for CORS handling
before_request = ["custom_app.middleware.setup_cors"]
after_request = ["custom_app.middleware.add_cors_headers"]

# Register API routes
app_include_js = "/assets/js/custom_app.min.js"
app_include_css = "/assets/css/custom_app.min.css"

# On app init
on_app_init = ["custom_app.routes.register_api_routes"] 