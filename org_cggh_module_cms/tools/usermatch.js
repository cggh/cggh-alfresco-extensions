var folder = null;

folder = companyhome.childByNamePath('/Sites/sequencing/documentLibrary/Collaborations');

var collabNodes = new Array();
if (folder != null && folder.children != null) {
    var allNodesInFolder = folder.children;
    for each (node in allNodesInFolder) {
        if (node.isSubType("cggh:collaborationFolder")) {
        //  logger.log(node.properties["cm:name"]);
        	var types = [ "cggh:primaryContactList", "cggh:contactList", "cggh:associates"];
        	//logger.log(node);
        	for each (type in types) {
        		var people = node.assocs[type];
        		for each (person in people) {
                  found = false;
                  contactMail = person.properties["dl:contactEmail"];
                  if (contactMail != '') {
                   // logger.log(person.properties["dl:contactEmail"]);
                    searchQuery="@cm\\:email:\"" +contactMail + "\"";
                    //logger.log(searchQuery);
                    var ssoPerson = search.luceneSearch(searchQuery);
                    if (ssoPerson.length == 1) {
                   //   logger.log(node.properties["cm:name"] + " Found by mail:" + ssoPerson[0].properties["cm:userName"]);
                      found = true;
                    } 
                  }
                  if (!found) {
                    searchQuery="@cm\\:firstName:\"" +person.properties["dl:contactFirstName"] + "\" AND @cm\\:lastName:\"" + person.properties["dl:contactLastName"] + "\"";
                    //logger.log(searchQuery);
                    var ssoPerson = search.luceneSearch(searchQuery);
                    if (ssoPerson.length == 1) {
                    //  logger.log(node.properties["cm:name"] + " Found by name:" + ssoPerson[0].properties["cm:userName"]);
                      found = true;
                    } 
                  }
                  if (!found) {
                    logger.log(node.properties["cm:name"] + "\t" + type + "\t" + person.properties["dl:contactFirstName"] + "\t" + person.properties["dl:contactLastName"] + "\t" + person.properties["dl:contactCompany"] + "\t" + contactMail);
                  }
        		}
        	}
        }
        	
    }
}