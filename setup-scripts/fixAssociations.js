var folder = null;

folder = companyhome.childByNamePath('/Sites/sequencing/documentLibrary/Collaborations');

var allNodesInFolder = folder.children;
for each (node in allNodesInFolder) {
    if (node.isSubType("cggh:collaborationFolder")) {
        var myName = node.name;
        var nodeid = myName.substr(0,4);

        var groupsToCreate = ["PI", "Contact", "Mail", "Data", "Public", "NotPublic"];

        for each (group in groupsToCreate) {
            var ldapName = group.toLowerCase();
            if (ldapName == "notpublic") {
                ldapName = "notPublic";
            }
            var assocName = "group" + group;

            var assoc = node.assocs['{http://alfresco.cggh.org/model/custom/1.0}'+assocName];

            if (assoc == null) {
                logger.log("Missing assoc:" + myName + ":" + ldapName);


                var assoc_action = actions.create("cggh-associate-group");
                assoc_action.parameters.association_name = assocName;
                assoc_action.parameters.group = "GROUP_" + nodeid + "_" + ldapName;

                try{
                    assoc_action.execute(node);
                } catch(excep) {
                    //Despite catching it - if there is an exception the whole thing won't work...
                    logger.log(document);
                    logger.log(excep);
                }

            } else {
                var id = "GROUP_" + nodeid + "_" + ldapName;
                for (var i=0;i < assoc.length; i++) {

                    if(assoc[i].properties['cm:authorityName'] != id) {
                        logger.log(id);
                        logger.log(assoc[i].id);
                        node.removeAssociation(assoc[i], '{http://alfresco.cggh.org/model/custom/1.0}'+assocName);
                    }
                }
            }
        }
    }
}




