var create = actions.create("cggh-create-ldap-group");
create.parameters.group="cc";
create.parameters.parent="ou=aaa,ou=groups,dc=malariagen,dc=net";
create.parameters.ou="false";
create.parameters.member="cn=ZT0VJHPI2RDAC647,ou=users,ou=people,dc=malariagen,dc=net";
create.execute(document);
