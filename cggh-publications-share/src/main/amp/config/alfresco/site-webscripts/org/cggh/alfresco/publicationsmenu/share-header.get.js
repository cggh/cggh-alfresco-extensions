var appMenu = widgetUtils.findObject(model.jsonModel, "id",
		"HEADER_APP_MENU_BAR");
if (appMenu != null) {
	var loggingWidget = {
		name : "alfresco/header/AlfMenuBarPopup",
		config : {
			label : "Collaborations",
			widgets : [ {
				name : "alfresco/header/AlfMenuItem",
				config : {
					label : "Overview",
					targetUrl : "overview"
				}
			}, {
				name : "alfresco/header/AlfMenuItem",
				config : {
					label : "List",
					targetUrl : "collaborations"
				}
			} ]
		}

	};

	appMenu.config.widgets.push(loggingWidget);
}