var nodes = search.luceneSearch("@name:Collaborations");

for each(var child in nodes) {
  for each (var node in child.children) {
    node.specializeType('cggh:collaborationFolder');
    logger.log(node.name + " (" + node.typeShort + "): " + node.nodeRef);
    print (node.getTags());
    var tags = node.getTags();
    var countries = new Array();
    var speciesArray = new Array();
    var contacts = new Array();
    
    for (var i =0 ; i<tags.length;i++) {
      logger.log(tags[i]);
      var elems = tags[i].split('=');
      
      if (elems[0] == 'species') {
    	  var species = elems[1].substring(0,1).toUpperCase() + elems[1].substring(1);
        speciesArray.push(species);
      }
      if (elems[0] == 'contact') {
        contacts.push(elems[1]);
      }
      if (elems[0] == 'status') {
          node.properties["cggh:collaborationStatus"] = elems[1];
      }
      if (elems[0] == 'country') {
    	  var country = elems[1].toUpperCase();
    	  if (country == "THE GAMBIA") {
    		country = "GAMBIA";  
    	  }
    	  if (country == "TANZANIA") {
        	country = "TANZANIA, UNITED REPUBLIC OF";      		  
      	  }
    	  if (country == "VIETNAM") {
      		country = "VIET NAM";
    	  }
    	  countries.push(country);
      }
    }
    
    node.properties["cggh:sampleCountry"] = countries;
    node.properties["cggh:species"] = speciesArray;
    node.properties["cggh:primaryContact"] = contacts;
    node.save();
    node.clearTags();
  }
}

