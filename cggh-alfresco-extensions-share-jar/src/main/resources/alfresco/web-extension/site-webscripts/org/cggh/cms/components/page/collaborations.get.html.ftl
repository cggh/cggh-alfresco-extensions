<#assign id = args.htmlid>
<#assign jsid = args.htmlid?js_string>
<script type="text/javascript">//<![CDATA[
(function()
{
   new Cggh.dashlet.Collaborations("${jsid}").setOptions(
   {
      imapEnabled: ${imapServerEnabled?string},
      listSize: 11
   }).setMessages(${messages});
   new Alfresco.widget.DashletResizer("${jsid}", "${instance.object.id}");
})();
//]]></script>

<div class="dashlet collaborations">
   <div class="title">${msg("header")}</div>
   <div class="toolbar flat-button">
      <div class="hidden">
         <span class="align-left yui-button yui-menu-button" id="${id}-type">
            <span class="first-child">
               <button type="button" tabindex="0">${msg("filter.all")}</button>
            </span>
         </span>
         <select id="${id}-type-menu">
            <option value="all">${msg("filter.all")}</option>
            <option value="favs">${msg("filter.favs")}</option>
         </select>
         <span class="align-left yui-button yui-menu-button" id="${id}-status">
            <span class="first-child">
               <button type="button" tabindex="1">${msg("filter.all")}</button>
            </span>
         </span>
         <select id="${id}-status-menu" multiple="multiple">
          	<option value="all" selected="selected">${msg("filter.status.all")}</option>
            <option value="enquiry">${msg("filter.status.enquiry")}</option>
            <option value="active">${msg("filter.status.active")}</option>
            <option value="declined">${msg("filter.status.renegotiation")}</option>
            <option value="aborted">${msg("filter.status.aborted")}</option>
            <option value="closed">${msg("filter.status.closed")}</option>
         </select>
         <span class="align-left yui-button yui-menu-button" id="${id}-enquiry">
            <span class="first-child">
               <button type="button" tabindex="2">${msg("filter.all")}</button>
            </span>
         </span>
         <select id="${id}-enquiry-menu" multiple="multiple">
          	<option value="all" selected="selected">${msg("filter.enquiry.all")}</option>
            <option value="enquiry email received">${msg("filter.enquiry.enquiryemailreceived")}</option>
            <option value="dialogue open">${msg("filter.enquiry.dialogueopen")}</option>
            <option value="awaiting funding">${msg("filter.enquiry.awaitingfunding")}</option>
            <option value="application form sent">${msg("filter.enquiry.applicationformsent")}</option>
            <option value="application to be presented to SG">${msg("filter.enquiry.applicationtobepresentedtoSG")}</option>
            <option value="under consideration by DK">${msg("filter.enquiry.underconsiderationbyDK")}</option>
            <option value="collaboration agreement being drawn">${msg("filter.enquiry.collaborationagreementbeingdrawn")}</option>
            <option value="collaboration agreement sent">${msg("filter.enquiry.collaborationagreementsent")}</option>
            <option value="collaboration active">${msg("filter.enquiry.collaborationactive")}</option>
         </select>
         <span class="align-left yui-button yui-menu-button" id="${id}-species">
            <span class="first-child">
               <button type="button" tabindex="3">${msg("filter.all")}</button>
            </span>
         </span>       
         <select id="${id}-species-menu" multiple="multiple">
          	<option value="all" selected="selected">${msg("filter.species.all")}</option>
            <option value="P. falciparum">${msg("filter.species.P.falciparum")}</option>
            <option value="P. vivax">${msg("filter.species.P.vivax")}</option>
            <option value="P. malariae">${msg("filter.species.P.malariae")}</option>
            <option value="P. berghei">${msg("filter.species.P.berghei")}</option>
            <option value="P. all">${msg("filter.species.P.all")}</option>
            <option value="A. gambiae">${msg("filter.species.A.gambiae")}</option>
            <option value="Human">${msg("filter.species.Human")}</option>
         </select>
         <span class="align-left yui-button yui-menu-button" id="${id}-rag">
            <span class="first-child">
               <button type="button" tabindex="3">${msg("filter.all")}</button>
            </span>
         </span>       
         <select id="${id}-rag-menu" multiple="multiple">
          	<option value="all" selected="selected">${msg("filter.rag.all")}</option>
            <option value="red">${msg("filter.rag.red")}</option>
            <option value="amber">${msg("filter.rag.amber")}</option>
            <option value="green">${msg("filter.rag.green")}</option>
            <option value="inactive">${msg("filter.rag.inactive")}</option>
         </select>
         <div class="clear"></div>
      </div>
   </div>
   <div id="${id}-collaborations" class="body" <#if args.height??>style="height: ${args.height}px;"</#if>></div>
</div>