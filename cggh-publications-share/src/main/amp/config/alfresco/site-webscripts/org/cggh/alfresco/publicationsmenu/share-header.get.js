var appMenu = widgetUtils.findObject(model.jsonModel, "id",
		"HEADER_APP_MENU_BAR");
if (appMenu != null) {
	var loggingWidget = {
		name : "alfresco/header/AlfMenuBarPopup",
		config : {
			label : "Publications",
			widgets : [  {
				name : "alfresco/header/AlfMenuItem",
				config : {
					label : "List",
					targetUrl : "/hdp/ws/publications"
				}
			} ]
		}

	};

	appMenu.config.widgets.push(loggingWidget);
}