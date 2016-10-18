var myName = document.name;
var nodeid = myName.substr(0,4);
var title = document.properties["cm:title"];

var create = actions.create("cggh-create-ldap-group");
create.parameters.group=nodeid;
create.parameters.parent="ou=studies,ou=groups,dc=malariagen,dc=net";
create.parameters.ou="true";
create.parameters.member="cn=pwmTestUser,ou=users,ou=people,dc=malariagen,dc=net";
create.parameters.description=nodeid + " " + title;
create.execute(document);

var groupsToCreate = ["PI", "Contact", "Mail", "Data", "Public"];
for each (group in groupsToCreate) {
    var create = actions.create("cggh-create-ldap-group");
    create.parameters.group=group.toLowerCase();
    create.parameters.parent="ou=" + nodeid + ",ou=studies,ou=groups,dc=malariagen,dc=net";
    create.parameters.ou="false";
    create.parameters.member="cn=pwmTestUser,ou=users,ou=people,dc=malariagen,dc=net";
    create.parameters.description=nodeid + "_" + group.toLowerCase();
    create.execute(document);
    
    
    var assoc_action = actions.create("cggh-associate-group");

    assoc_action.parameters.association_name = "group" + group;
    assoc_action.parameters.group = "GROUP_" + nodeid + "_" + group.toLowerCase();
    logger.log("Adding " + assoc_action.parameters.association_name + " " + assoc_action.parameters.group);
    try{
        assoc_action.execute(document);
    } catch(excep) {
        //Despite catching it - if there is an exception the whole thing won't work...
        logger.log(document);
        logger.log(excep);
    }
}

