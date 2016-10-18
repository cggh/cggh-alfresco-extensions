var docs = search.luceneSearch('TYPE:"cm:person"');
var fields = ["cm:userName","cm:email","cm:companyemail","cm:jobtitle","cm:firstName","cm:lastName","cm:organization","cm:companyaddress1","cm:companyaddress2","cm:companyaddress3","cm:companyfax","cm:companypostcode","cm:companytelephone","cm:telephone","cm:mobile","cm:skype","cm:googleusername","cm:instantmsg","cm:location"]

   var log = "";
   for (var i=0; i<docs.length; i++)
   {
     var doc = docs[i];

	 var out = "";
     for (var j=0;j<fields.length; j++) {
       out += '"'+ doc.properties[fields[j]] + '",';
     }
     logger.log(out + '\n');
 
   }
