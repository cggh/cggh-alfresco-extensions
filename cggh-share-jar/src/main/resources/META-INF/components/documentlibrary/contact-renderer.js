(function()
{
   var $html = Alfresco.util.encodeHTML,
      $isValueSet = Alfresco.util.isValueSet;

   if (Alfresco.DocumentList)
   {
	   var renderContact = function contact_renderer(record, label)
       {
           var jsNode = record.jsNode,
              properties = jsNode.properties,
              id = Alfresco.util.generateDomId(),
              html = "",
              associationType;
           
         //Nasty hack
           var regex = />([a-zA-Z:]*)\|/;
           if (regex.test(label)) {
        	   var parsed = label.match(regex);
        	   associationType = parsed[1];
        	   var remove = parsed[1] + '\|';
        	   var l1 = label.replace(remove,"");
        	   label = l1;
           }
           var content = "";
           if (associationType == 'R:cggh:mainContact')
           {
        	   content = properties['cggh:primaryContact'];
        	   
           } else if (associationType == 'R:cggh:otherContacts')
           {
        	   content = properties['cggh:otherContact'];
           }
           return '<span id="' + id + '" class="item">' + label + content + '</span>';
        };
      YAHOO.Bubbling.fire("registerRenderer",
      {
         propertyName: "cggh_mainContact",
         renderer: renderContact
      });
      YAHOO.Bubbling.fire("registerRenderer",
    	      {
    	         propertyName: "cggh_otherContacts",
    	         renderer: renderContact
    	      });
   }
})();