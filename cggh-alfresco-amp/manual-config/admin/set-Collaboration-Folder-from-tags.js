var nodes = document.children;


  for each (var node in document.children) {
    node.specializeType('cggh:collaborationFolder');
   // logger.log(node.name + " (" + node.typeShort + "): " + node.nodeRef);
   // print (node.getTags());
    var tags = node.getTags();
    var countries = new Array();
    var speciesArray = new Array();
    var contacts = new Array();
    
    for (var i =0 ; i<tags.length;i++) {
      logger.log(tags[i]);
      var elems = tags[i].split('=');
      if (elems.length != 2)
        continue;
      var name = elems[0].trim();
      var value = elems[1].trim();
      logger.log('#'+name+"#"+value);
      if (name == 'species') {
    	  var species = value.substring(0,1).toUpperCase() + value.substring(1);
        logger.log("species:" + species);
        speciesArray.push(species);
      }
      if (name == 'contact') {
    	  var names = value.split(' ');
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
               logger.log("Contact for " + value + " found " + cont.name);
            }
        }
      }
      if (name == 'status') {
            logger.log("status:" + value);
          if (value == 'exploration') {
              node.properties["cggh:collaborationStatus"] = 'enquiry';
              node.properties["cggh:enquiryStatus"] = 'dialogue open';
          } else {
            node.properties["cggh:collaborationStatus"] = value;
          }
        }
      if (name == 'country') {
    	  var country = value.toUpperCase();
    	  if (country == "THE GAMBIA") {
    		country = "GAMBIA";  
    	  }
    	  if (country == "TANZANIA") {
        	country = "TANZANIA (UNITED REPUBLIC OF)";
      	  }
    	  if (country == "VIETNAM") {
      		country = "VIET NAM";
    	  }
        logger.log("country:" + country);
    	  countries.push(country);
      }
    }
    
    node.properties["cggh:sampleCountry"] = countries;
    node.properties["cggh:species"] = speciesArray;
    node.properties["cggh:contacts"] = contacts;
    node.save();
  }


