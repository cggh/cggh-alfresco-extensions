

var contacts = new Array();
for each (var assoc in document.assocs["cggh:contactList"]) {
  contacts.push(assoc.properties["cm:name"]);
}
document.properties["cggh:contacts"] = contacts;

document.save();