var docs = search.luceneSearch('TYPE:"cm:person"');
   var log = "";
   for (var i=0; i<docs.length; i++)
   {
     var doc = docs[i];
     var userName = doc.properties["cm:userName"];
     if (userName == "IanWright") {
       log = "Name: " + docs[i].name + " " + userName ;
     logger.log(log);
     var manage = actions.create("cggh-manage-ldap-user");
       manage.parameters.userId = "uid";
       manage.parameters.searchBase =  "ou=users,ou=people,dc=malariagen,dc=net";
     manage.execute(doc);
     }
   }