
var contacts = new Array();
for each (var assoc in document.assocs["cggh:studySites"]) {
  contacts.push(assoc.properties["cm:name"]);
}
document.properties["cggh:sites"] = contacts;

document.save();