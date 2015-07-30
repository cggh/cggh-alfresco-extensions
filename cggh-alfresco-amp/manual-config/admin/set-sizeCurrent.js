var members = search.luceneSearch("TYPE:\"cm:person\"");

   for (var i=0; i<members.length; i++)
   {
     var doc = members[i];
     logger.log(doc);
     if (!doc.properties["cm:sizeCurrent"]) {
       doc.properties["cm:sizeCurrent"] = 0;
       doc.save()
     }

   }