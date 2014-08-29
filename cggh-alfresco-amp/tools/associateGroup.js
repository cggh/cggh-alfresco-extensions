document = search.findNode('workspace://SpacesStore/ed245943-6104-47e7-95d6-7c2afee03bad');
logger.log(document);

        for each (targetNode in document.assocs["cggh:groupPI"]) {
                document.removeAssociation(targetNode, "cggh:groupPI");
        }

for each (targetNode in document.assocs["cggh:groupContact"]) {
                document.removeAssociation(targetNode, "cggh:groupContact");
        }

for each (targetNode in document.assocs["cggh:groupData"]) {
                document.removeAssociation(targetNode, "cggh:groupData");
        }

for each (targetNode in document.assocs["cggh:groupMail"]) {
                document.removeAssociation(targetNode, "cggh:groupMail");
        }

for each (targetNode in document.assocs["cggh:groupPublic"]) {
                document.removeAssociation(targetNode, "cggh:groupPublic");
        }

// create mail action
  var mail = actions.create("cggh-associate-group");
mail.parameters.association_name = "groupPI";
  mail.parameters.group = "GROUP_1126_pi";
  
  //execute action against a document
 mail.execute(document);

mail.parameters.association_name = "groupContact";
  mail.parameters.group = "GROUP_1126_contact";
  
  //execute action against a document
 mail.execute(document);

mail.parameters.association_name = "groupMail";
  mail.parameters.group = "GROUP_1126_mail";
  
  //execute action against a document
 mail.execute(document);

mail.parameters.association_name = "groupPublic";
  mail.parameters.group = "GROUP_1126_public";
  
  //execute action against a document
 mail.execute(document);
var maild = actions.create("cggh-associate-group");
  maild.parameters.association_name = "groupData";
  maild.parameters.group = "GROUP_1126_data";
  
  //execute action against a document
  maild.execute(document);
