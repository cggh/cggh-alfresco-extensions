
//Not ===
if (document.getType() == "{http://www.alfresco.org/model/forum/1.0}post") {
  var site = document.parent.parent.parent.name;
  var siteGroup = "GROUP_site_" + site;
  var template = "Data Dictionary/Email Templates/Notify Email Templates/share_discussion_notification.ftl";
 
  // create mail action
  var mail = actions.create("mail");
  mail.parameters.to_many = siteGroup;

  mail.parameters.from = "alfresco-notifications@cggh.org";

  mail.parameters.subject="New Post in Discussion: "+document.parent.childAssocs["cm:contains"][0].properties.title;

  mail.parameters.template = companyhome.childByNamePath(template);
 
  //execute action against a document
  mail.execute(document);

}