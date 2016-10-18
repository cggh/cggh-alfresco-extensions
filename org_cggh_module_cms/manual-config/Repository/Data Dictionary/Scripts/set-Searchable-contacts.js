

var contacts = new Array();
for each (var assoc in document.assocs["cggh:contactList"]) {
	var name = assoc.properties["dl:contactFirstName"] + ' ' + assoc.properties["dl:contactLastName"]; 
  contacts.push(name);
}
document.properties["cggh:contacts"] = contacts;

contacts = new Array();
for each (var assoc in document.assocs["cggh:primaryContactList"]) {
    var name = assoc.properties["dl:contactFirstName"] + ' ' + assoc.properties["dl:contactLastName"]; 
  contacts.push(name);
}
document.properties["cggh:primaryContacts"] = contacts;
document.save();