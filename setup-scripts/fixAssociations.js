var folder = companyhome.childByNamePath('/Sites/sequencing/documentLibrary/Collaborations');
//logger.log(noderef);
for each (var node in folder.children) {

    if (node.typeShort == "cggh:collaborationFolder") {
        
        var assocToRemove = ["cggh:primaryContactList",
        "cggh:contactList",
        "cggh:associates",
        "cggh:groupPI",
        "cggh:groupData",
        "cggh:groupMail",
        "cggh:groupContact",
        "cggh:groupPublic",
        "cggh:groupNotPublic"];

        var assocToCreate = ["PI", "Contact", "Mail", "Data", "Public", "notPublic"];
        
        var nodeid = node.name.substr(0,4);
        logger.log(node.name + " (" + node.typeShort + "): " + node.nodeRef);
        logger.log(nodeid);
      
        var assoc_action = actions.create("cggh-associate-group");
        for each (create in assocToCreate) {
            assoc_action.parameters.association_name = "group" + create;
          if (node.assocs["cggh:" + assoc_action.parameters.association_name] == null) {
            assoc_action.parameters.group = "GROUP_" + nodeid + "_" + create.toLowerCase();
            logger.log("Adding " + assoc_action.parameters.association_name + " " + assoc_action.parameters.group);
          
            try{
                assoc_action.execute(node);
            } catch(excep) {
                //Despite catching it - if there is an exception the whole thing won't work...
                logger.log(node);
                logger.log(excep);
            }
          }
        }
    }

}
