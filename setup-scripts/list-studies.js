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
            if (node.properties["cggh:enquiryStatus"] != null) {
                logger.log('collab.properties["cggh:enquiryStatus"]="' + node.properties["cggh:enquiryStatus"] + '";');
            }
            logger.log('collab.properties["cggh:ragStatus"]="' + node.properties["cggh:ragStatus"] + '";');
            logger.log('collab.properties["cggh:samplesExpected"]=' + node.properties["cggh:samplesExpected"] + ";");
            logger.log('collab.properties["cggh:samplesProcessed"]=' + node.properties["cggh:samplesProcessed"] + ";");
            logger.log('collab.properties["cggh:title"]=' + node.properties["cggh:title"] + ";");
            logger.log('collab.properties["cggh:description"]=' + node.properties["cggh:description"] + ";");
            if (node.properties["cggh:firstSample"] != null) {
                logger.log('collab.properties["cggh:firstSample"]="' + utils.toISO8601(node.properties["cggh:firstSample"]) + '";');
            }
            if (node.properties["cggh:lastSample"] != null) {
                logger.log('collab.properties["cggh:lastSample"]="' + utils.toISO8601(node.properties["cggh:lastSample"]) + '";');
            }
            if (node.properties["cggh:ethicsExpiry"] != null) {
                logger.log('collab.properties["cggh:ethicsExpiry"]="' + utils.toISO8601(node.properties["cggh:ethicsExpiry"]) + '";');
            }
            if (node.properties["cggh:nextReview"] != null) {
                logger.log('collab.properties["cggh:nextReview"]="' + utils.toISO8601(node.properties["cggh:nextReview"]) + '";');
            }
            if (node.properties["cggh:sampleCountry"] != null) {
                logger.log('collab.properties["cggh:sampleCountry"]= ["' + node.properties["cggh:sampleCountry"].join('","') + '"];');
            }
            if (node.properties["cggh:species"] != null) {
                logger.log('collab.properties["cggh:species"]= ["' + node.properties["cggh:species"].join('","') + '"];');
            }
            logger.log("collab.save();");
        }
    }
}
