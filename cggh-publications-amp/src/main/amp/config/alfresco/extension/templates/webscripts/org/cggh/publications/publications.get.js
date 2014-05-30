var folder = null;

folder = companyhome.childByNamePath('/Sites/pct/documentLibrary/Draft');

var publicationNodes = new Array();
if (folder != null && folder.children != null) {
    var allNodesInFolder = folder.children;
    for each (node in allNodesInFolder) {
        if (node.isSubType("cggh-pub:publicationFolder")) {
        	publicationNodes.push(node);
        }
    }
}
model.publicationNodes = publicationNodes;

