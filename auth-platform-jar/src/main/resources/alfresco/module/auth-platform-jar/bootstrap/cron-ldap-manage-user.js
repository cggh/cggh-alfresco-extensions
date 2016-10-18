var docs = search.luceneSearch('TYPE:"cm:person"');
var log = "";
for (var i = 0; i < docs.length; i++) {
	var doc = docs[i];
	var userName = doc.properties["cm:userName"];
	var manage = actions.create("cggh-manage-ldap-user");
	manage.parameters.userId = "malariagenUID";
	manage.parameters.searchBase = "ou=users,ou=people,dc=malariagen,dc=net";
	manage.parameters.dn = "cn=siteUsers,ou=alfresco,ou=groups,dc=malariagen,dc=net";
	manage.execute(doc);

}

// Required for inbound email
var nameTargetgroup = 'EMAIL_CONTRIBUTORS';
var groupPrefix = "GROUP_";

function userBelongsToGroup(_person, _groupTarget) {
	var found = false;
	var containerGroups = people.getContainerGroups(_person);

	for (var i = 0; i < containerGroups.length; i++) {
		if (containerGroups[i].properties["cm:authorityName"] == _groupTarget.properties["cm:authorityName"]) {
			// logger.log(person.properties["cm:email"] + " is a member");
			found = true;
			break;
		}
		;
		// logger.log(containerGroups[i].properties["cm:authorityName"]);
	}
	;

	return found;
}

// get members
var members = search.luceneSearch("workspace://SpacesStore",
		"TYPE:\"cm:person\"");

if (members) {
	// get target group
	var groupTarget = people.getGroup(groupPrefix + nameTargetgroup);

	if (groupTarget) {
		// loop over all members of the source group and add them to the target
		// group
		for (var i = 0; i < members.length; i++) {
			var person = members[i];

			if (people.isAdmin(person))
				continue;
			if (people.isGuest(person))
				continue;
			if (userBelongsToGroup(person, groupTarget))
				continue;
			var email = person.properties["cm:email"];
			if (!email || (0 == email.length))
				continue;

			logger.log(person.properties["cm:userName"]
					+ " is NOT member of EMAIL_CONTRIBUTORS group. Adding...");

			try {
				people.addAuthority(groupTarget, person);
			} catch (ex) {
				logger.log("ABORT: exception ocurred: " + ex);
				break;
			}
			;
		}
		;
	}
	;
};