//From http://jared.ottleys.net/alfresco/alfresco-share-discussion-notification

var emailAddresses = [];
 
//for p expresion variable
var p, e, a;
 
//change to use your template
var template = "Data Dictionary/Email Templates/Notify Email Templates/share_discussion_notification.ftl";
 
function getEmail(person) {
    var personNode = people.getPerson(person);
    return personNode.properties.email;
}
 
// build emailAddresses
for (p = 0; p &lt; document.parent.childAssocs["cm:contains"].length; p += 1) {
    var user = document.parent.childAssocs["cm:contains"][p].properties.creator;
    var email = getEmail(user);
 
    //Is the emailAddress already in the array? If not, add it
    if (emailAddresses.length &gt; 0) {
        var match = false;
        for (e = 0; e &lt; emailAddresses.length; e += 1) {
            if (emailAddresses[e] === email) {
                match = true;
                break;
            }
        }
 
        if (!match) {
            emailAddresses.push(email);
        }
    } else {
        emailAddresses.push(email);
    }
}
 
// create mail action
var mail = actions.create("mail");
mail.parameters.subject = "New Post in Discussion: " + document.parent.childAssocs["cm:contains"][0].properties.title;
mail.parameters.template = companyhome.childByNamePath(template);
 
//send an email for each address
for (a = 0; a &lt; emailAddresses.length; a += 1) {
    mail.parameters.to = emailAddresses[a];
    mail.parameters.from = "aws.cggh@gmail.com";
    //execute action against a document
    mail.execute(document);
}