var userMenuWidgets = widgetUtils.findObject(model.jsonModel, "id",
		"HEADER_USER_MENU");
if (userMenuWidgets != null) {

	userMenuWidgets.config.widgets.push({
		id : "HEADER_USER_MENU_LOGOUT",
		name : "alfresco/header/AlfMenuItem",
		config : {
            id: "HEADER_USER_MENU_CHANGE_PASSWORD",
            label: "change_password.label",
            iconClass: "alf-user-password-icon",
            targetUrl: "user/" + encodeURIComponent(user.name) + "/change-password"
		}
	});

}

var changePasswordItem = widgetUtils.findObject(model.jsonModel, "id",
		"HEADER_USER_MENU_PASSWORD");
if (changePasswordItem != null) {
	changePasswordItem.config.targetUrl = "https://www.malariagen.net/pwm/private/ChangePassword";
}
