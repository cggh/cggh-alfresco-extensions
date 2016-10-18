if (!user.isAdmin) {
	widgetUtils.deleteObjectFromArray(model.jsonModel, "id", "HEADER_PEOPLE");
}