var folder = null;

folder = companyhome.childByNamePath('/Sites/sequencing/documentLibrary/Collaborations');
logger.log("var folder = companyhome.childByNamePath('/Sites/sequencing/documentLibrary/Collaborations');");

var collabNodes = new Array();
if (folder != null && folder.children != null) {
    var allNodesInFolder = folder.children;
    for each (node in allNodesInFolder) {
        if (node.isSubType("cggh:collaborationFolder")) {
          
            logger.log("var collab = folder.createNode(\"" + node.properties["cm:name"] +"\", \"cggh:collaborationFolder\");");
            logger.log("collab.addAspect(\"{http://alfresco.cggh.org/model/custom/1.0}collaborationData\");");
            logger.log("collab.save();");
        }
    }
}
