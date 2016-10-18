
var docs = search.luceneSearch('TYPE:"cm:person"');
   var log = "";
   for (var i=0; i<docs.length; i++)
   {
     var doc = docs[i];
     var userName = doc.properties["cm:userName"];
     var manage = actions.create("cggh-manage-ldap-user");
       manage.parameters.userId = "uid";
       manage.parameters.searchBase = "dc=malariagen,dc=net";
     manage.execute(doc);

   }