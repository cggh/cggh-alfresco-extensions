var nodes = document.children;


  for each (var node in document.children) {
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
    	  var names = elems[1].split(' ');
          if (names.length > 1) {
            var firstName = names[0].substring(0,1).toUpperCase() + names[0].substring(1);
            var lastName = names[1].substring(0,1).toUpperCase() + names[1].substring(1);
            var searchQuery = '@dl\\:contactFirstName:\"' + firstName + '\" AND @dl\\:contactLastName:\"' + lastName + '\"';
           logger.log(searchQuery);
            var conts = search.luceneSearch(searchQuery);
           // var conts = Array();
            for each(var cont in conts) {
    		  node.createAssociation(cont, "cggh:contactList");
    		  contacts.push(cont.name);
               logger.log("Contact for " + elems[1] + " found " + cont.name);
            }
        }
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
    node.properties["cggh:contacts"] = contacts;
    node.save();
  }


