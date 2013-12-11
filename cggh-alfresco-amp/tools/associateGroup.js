  // create mail action
  var mail = actions.create("cggh-associate-group");
  mail.parameters.association_name = "groupPI";
  mail.parameters.group = "GROUP_1001_PI";
  
  //execute action against a document
  mail.execute(document);
