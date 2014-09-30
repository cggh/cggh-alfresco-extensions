<#assign el=args.htmlid?js_string/>
<@markup id="css" >
   <#-- CSS Dependencies -->
   <@link href="${url.context}/res/components/folder-details/groups.css" group="collaboration-details"/>
</@>

<@markup id="js">
   <#-- JavaScript Dependencies -->
   <@script src="${url.context}/res/components/folder-details/groups.js" group="collaboration-details" />
</@>

<div class="folder-details-panel">
  <h2 id="${el}-heading" class="thin dark">${msg("heading")}</h2>
  <span>
  <div id="${el}-PIContainer"><h3>${msg("pi")}</h3></div>
  <div id="${el}-ContactContainer"><h3>${msg("contact")}</h3></div>
  <div id="${el}-PublicContainer"><h3>${msg("public")}</h3></div>
  <div id="${el}-MailContainer"><h3>${msg("mail")}</h3></div>
  <div id="${el}-DataContainer"><h3>${msg("data")}</h3></div>
  </span>
      <@inlineScript group="collaboration-details">
         YAHOO.util.Event.onContentReady("${args.htmlid?js_string}-heading", function() {
            Alfresco.util.createTwister("${args.htmlid?js_string}-heading", "FolderGroupMembers");
         });
      </@>

</div>

    <@createWidgets group="collaboration-details"/>


                