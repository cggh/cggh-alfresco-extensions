//Mimic the effect of the Collaboration Folder behaviour for migration purposes

var folder = null;

folder = companyhome.childByNamePath('/Sites/sequencing/documentLibrary/Collaborations');

if (folder != null && folder.children != null) {
    var allNodesInFolder = folder.children;
	var i = 0;
    for each (node in allNodesInFolder) {
		
        if (node.isSubType("cggh:collaborationFolder")) {
			//Projects can be updated by changing the name in the data list
			//Easiest way is to remove the association and re-add, then the behaviour will work as expected
			if (node.assocs["cggh:liaison"] != null) {
				var liaison = node.assocs["cggh:liaison"][0];
				node.removeAssociation(liaison, "cggh:liaison");
				node.save();
				node.createAssociation(liaison, "cggh:liaison");
				node.save();
			}
			if (node.assocs["cggh:collaborationDoc"] != null) {
				var cDoc = node.assocs["cggh:collaborationDoc"][0];
				node.removeAssociation(cDoc, "cggh:collaborationDoc");
				node.save();
				node.createAssociation(cDoc, "cggh:collaborationDoc");
				node.save();
			}
			i = i + 1;
		}
		if (i > 2) {
	//		break;
		}
	}
}