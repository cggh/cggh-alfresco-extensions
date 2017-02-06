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
            logger.log('collab.properties["cggh:collaborationStatus"]="' + node.properties["cggh:collaborationStatus"] + '";');
            logger.log('collab.properties["cggh:samplesExpected"]=' + node.properties["cggh:samplesExpected"] + ";");
            logger.log('collab.properties["cggh:samplesProcessed"]=' + node.properties["cggh:samplesProcessed"] + ";");
          if (node.properties["cggh:firstSample"] != null) {
            logger.log('collab.properties["cggh:firstSample"]="' + utils.toISO8601(node.properties["cggh:firstSample"]) + '";');
          }
          if (node.properties["cggh:lastSample"] != null) {
            logger.log('collab.properties["cggh:lastSample"]="' + utils.toISO8601(node.properties["cggh:lastSample"]) + '";');
          }
          if (node.properties["cggh:sampleCountry"] != null) {
            logger.log('collab.properties["cggh:sampleCountry"]= ["' + node.properties["cggh:sampleCountry"].join('","') + '"];');
          }
            logger.log("collab.save();");
        }
    }
}
