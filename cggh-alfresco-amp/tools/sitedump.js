var groups = search.luceneSearch('TYPE:"cm:authorityContainer"');
var fields = ["cm:userName","cm:email"];
//,"cm:companyemail","cm:jobtitle","cm:firstName","cm:lastName","cm:organization","cm:companyaddress1","cm:companyaddress2","cm:companyaddress3","cm:companyfax","cm:companypostcode","cm:companytelephone","cm:telephone","cm:mobile","cm:skype","cm:googleusername","cm:instantmsg","cm:location"]

   var log = "";
   for (var i=0; i<groups.length; i++)
   {
     var group = groups[i];

     var out = '';
     for (var j=0;j<group.children.length; j++) {
         child = group.children[j];
     //  logger.log(child);
       if (child.type != '{http://www.alfresco.org/model/content/1.0}authorityContainer') {
         out += group.properties["cm:authorityName"] + ","
         for (var k=0;k<fields.length;k++) {
             out += '"'+ child.properties[fields[k]] + '",';
         }
         out += '\n';
       }
     }
     logger.log(out + '\n');
 
   }
