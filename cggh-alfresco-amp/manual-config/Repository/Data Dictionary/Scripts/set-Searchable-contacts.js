
for each (var assoc in document.assocs["cggh:mainContact"]) {
  document.properties["cggh:primaryContact"] = assoc.properties["cm:name"];
}

var contacts = new Array();
for each (var assoc in document.assocs["cggh:otherContacts"]) {
  contacts.push(assoc.properties["cm:name"]);
}
document.properties["cggh:otherContact"] = contacts;

document.save();