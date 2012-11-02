var folder = null;

folder = companyhome.childByNamePath('/Sites/sequencing/documentLibrary/Collaborations');

var collabNodes = new Array();
var allNodesInFolder = folder.children;
for each (node in allNodesInFolder) {
    if (node.isSubType("cggh:collaborationFolder")) {
    	collabNodes.push(node);
    }
}
model.collabNodes = collabNodes;

