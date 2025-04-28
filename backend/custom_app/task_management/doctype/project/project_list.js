frappe.listview_settings['Project'] = {
	add_fields: ["status", "start_date", "end_date"],
	get_indicator: function(doc) {
		if(doc.status === "Planning") {
			return [__("Planning"), "orange", "status,=,Planning"];
		} else if(doc.status === "Active") {
			return [__("Active"), "blue", "status,=,Active"];
		} else if(doc.status === "Completed") {
			return [__("Completed"), "green", "status,=,Completed"];
		} else if(doc.status === "Cancelled") {
			return [__("Cancelled"), "grey", "status,=,Cancelled"];
		}
	}
}; 