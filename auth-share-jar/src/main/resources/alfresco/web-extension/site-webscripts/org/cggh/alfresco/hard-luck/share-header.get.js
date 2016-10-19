if (!user.isAdmin) {
	widgetUtils.deleteObjectFromArray(model.jsonModel, "id", "HEADER_PEOPLE");
	widgetUtils.deleteObjectFromArray(model.jsonModel, "id", "HEADER_MY_FILES");
	widgetUtils.deleteObjectFromArray(model.jsonModel, "id", "HEADER_SHARED_FILES");
	widgetUtils.deleteObjectFromArray(model.jsonModel, "id", "HEADER_SITES_MENU");
	widgetUtils.deleteObjectFromArray(model.jsonModel, "id", "HEADER_TASKS");
	widgetUtils.deleteObjectFromArray(model.jsonModel, "id", "HEADER_REPOSITORY");
	widgetUtils.deleteObjectFromArray(model.jsonModel, "id", "HEADER_SEARCH");
	widgetUtils.deleteObjectFromArray(model.jsonModel, "id", "HEADER_TITLE_BAR");
}