var logoutItem = 
  widgetUtils.findObject(model.jsonModel, "id", "HEADER_USER_MENU_LOGOUT");
if (logoutItem != null)
{
	logoutItem.config.targetUrl += "?redirectURL=https://www.malariagen.net/sso/logout&redirectURLQueryKey=service&redirectURLQueryValue=https://www.malariagen.net/";
}



var changePasswordItem = 
	  widgetUtils.findObject(model.jsonModel, "id", "HEADER_USER_MENU_PASSWORD");
if (changePasswordItem != null)
{
	changePasswordItem.config.targetUrl = "../../pwm/private/ChangePassword";
}