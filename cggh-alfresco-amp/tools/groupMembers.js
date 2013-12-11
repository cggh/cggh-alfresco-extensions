
print(document.name);

var contacts = new Array();
for each (var assoc in document.assocs["cggh:groupPI"]) {
  logger.log (assoc.properties["usr:members"]);
  logger.log(assoc);
  print (assoc);
  for each (var member in assoc.children) {
    logger.log(member);
    print (member.properties["cm:firstName"] + member.properties["cm:lastName"] + member.properties["cm:organization"]);
  }
  
}
