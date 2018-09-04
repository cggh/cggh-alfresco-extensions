var folder = null;

folder = companyhome.childByNamePath('/Sites/sequencing/documentLibrary/Collaborations');

var collabNodes = new Array();
if (folder != null && folder.children != null) {
	var allNodesInFolder = folder.children;
	for each (node in allNodesInFolder) {
		if (node.isSubType("cggh:collaborationFolder")) {

			var roundUpFractionalMonths = true;
			var date1 = node.properties["cggh:ethicsExpiry"];

			if (!date1) {
				continue;
			}
			var date2 = new Date(Date.now());
			// Months will be calculated between start and end dates.
			// Make sure start date is less than end date.
			// But remember if the difference should be negative.
			var startDate=date1;
			var endDate=date2;
			var inverse=false;
			if(date1>date2)
			{
				startDate=date2;
				endDate=date1;
				inverse=true;
			}

			// Calculate the differences between the start and end dates
			var yearsDifference=endDate.getUTCFullYear()-startDate.getUTCFullYear();
			var monthsDifference=endDate.getMonth()-startDate.getMonth();
			var daysDifference=endDate.getDate()-startDate.getDate();

			var monthCorrection=0;
			// If roundUpFractionalMonths is true, check if an extra month needs
			// to be added from rounding up.
			// The difference is done by ceiling (round up), e.g. 3 months and 1
			// day will be 4 months.
			if(roundUpFractionalMonths===true && daysDifference>0)
			{
				monthCorrection=1;
			}
			// If the day difference between the 2 months is negative, the last
			// month is not a whole month.
			else if(roundUpFractionalMonths!==true && daysDifference<0)
			{
				monthCorrection=-1;
			}

			var monthsBetween = (inverse?-1:1)*(yearsDifference*12+monthsDifference+monthCorrection);

			if (monthsBetween < -1 || monthsBetween > 0) {
				// create mail action
				var mail = actions.create("mail");
				mail.parameters.to = "ian.wright@well.ox.ac.uk";

				// unfortunately this doesn't work!
				currentUserName = ""; // workaround?

				// For normal mail action
				// Need to set mail.from.enabled=true in alfresco-global.properties
				// mail.parameters.from = document.properties["sys:node-dbid"] +
				// "@alfresco.malariagen.net";


				mail.parameters.subject = "Ethics approval about to expire for " + node.properties["cm:name"];

				mail.parameters.text = "Ethics approval about to expire for " + node.properties["cm:name"] + " on " + node.properties["cggh:ethicsExpiry"];

				// execute action against a document
				mail.execute(node);

			}
		}
	}
}
