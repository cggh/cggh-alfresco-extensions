var folder = null;

folder = companyhome.childByNamePath('/Sites/sequencing/documentLibrary/Collaborations');
var collab = null;
if (args.nodeRef != null) {
    collab = args.nodeRef
}

var collabNodes = new Array();
if (folder != null && folder.children != null) {
    var allNodesInFolder = folder.children;
    for each (node in allNodesInFolder) {
        if (node.isSubType("cggh:collaborationFolder")) {
            if (collab == null || node.nodeRef == collab) {
                collabNodes.push(node);
            }
        }
    }
}
model.searchTerm = collab
model.collabNodes = collabNodes;

