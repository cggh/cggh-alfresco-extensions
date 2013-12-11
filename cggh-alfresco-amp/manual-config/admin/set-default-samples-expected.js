var nodes = document.children;


  for each (var node in document.children) {
    //logger.log(node.properties["cggh:samplesExpected"]);
    if (node.properties["cggh:samplesExpected"] == '' || node.properties["cggh:samplesExpected"] == null) {
     //logger.log(node);
      node.properties["cggh:samplesExpected"] = 0;
      node.save();
    }
  }
