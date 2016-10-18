var siteGroup = "GROUP_site_" + document.parent.parent.parent.name;
var template = "Data Dictionary/Email Templates/Notify Email Templates/share_discussion_notification.ftl";
 
// create mail action
var mail = actions.create("mail");
mail.parameters.to_many = siteGroup;

mail.parameters.from = "alfresco-notifications@cggh.org";

mail.parameters.subject="New Post in Discussion: "+document.parent.childAssocs["cm:contains"][0].properties.title;
mail.parameters.template = companyhome.childByNamePath(template);
 
//execute action against a document
mail.execute(document);