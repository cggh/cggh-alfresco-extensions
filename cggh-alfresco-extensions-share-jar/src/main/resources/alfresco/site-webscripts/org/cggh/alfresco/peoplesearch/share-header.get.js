if (!user.isAdmin) {
	// Doesn't work as expected see
	// https://issues.alfresco.com/jira/browse/ALF-20384
	// widgetUtils.deleteObjectFromArray(model.jsonModel, "id",
	// "HEADER_PEOPLE");
	function findAndRemoveIn(obj, arrContext, arrIdx, id) {
		var idx, max, key;
		if (obj !== undefined && obj !== null) {
			if (Object.prototype.toString.apply(obj) === "[object Object]") {
				if (obj.hasOwnProperty("id") && obj.id === id) {
					if (arrContext !== null && arrIdx !== null) {
						arrContext.splice(arrIdx, 1);
					}

					else {
						logger
								.debug("Unexpected match outside of array structure: "
										+ jsonUtils.toJSONString(obj));
					}

				} else {
					for (key in obj) {
						if (obj.hasOwnProperty(key)) {
							findAndRemoveIn(obj[key], null, null, id);
						}

					}
				}
			} else if (Object.prototype.toString.apply(obj) === "[object Array]") {
				for (idx = 0, max = obj.length; idx < max; idx++) {
					findAndRemoveIn(obj[idx], obj, idx, id);
				}

			}
		}
	}

	var widget, widgetsToRemove = [ "HEADER_PEOPLE" ], idx, max;

	for (idx = 0, max = widgetsToRemove.length; idx < max; idx++) {
		findAndRemoveIn(model.jsonModel.widgets, null, null,
				widgetsToRemove[idx]);
	}

}