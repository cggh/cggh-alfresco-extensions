var nodes = document.children;


  for each (var node in document.children) {

    logger.log(node.name + " (" + node.typeShort + "): " + node.nodeRef);
    print (node.getProperties());
    logger.log(node.properties['dl:contactLastName']);
    logger.log(node.properties['dl:contactFirstName']);
    var first = node.properties['dl:contactFirstName'];
    var last = node.properties['dl:contactLastName'];
    var displayName = "";
    if (last != null && last.length > 0) {
      displayName = last;
    } else if (first != null && first.length > 0) {
      displayName = first;
    }
    if (first != null && first.length > 0 && last != null && last.length > 0) {
     displayName = last + ", " + first;
    }
    node.properties.name = displayName;
    node.save();  
    
  }

