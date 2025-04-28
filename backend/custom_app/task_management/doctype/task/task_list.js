frappe.listview_settings['Task'] = {
	add_fields: ["status", "priority", "start_date", "end_date"],
	get_indicator: function(doc) {
		if(doc.status === "Open") {
			return [__("Open"), "orange", "status,=,Open"];
		} else if(doc.status === "In Progress") {
			return [__("In Progress"), "blue", "status,=,In Progress"];
		} else if(doc.status === "Completed") {
			return [__("Completed"), "green", "status,=,Completed"];
		} else if(doc.status === "Cancelled") {
			return [__("Cancelled"), "grey", "status,=,Cancelled"];
		}
	}
};
