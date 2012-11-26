<#assign id = args.htmlid>
<#assign jsid = args.htmlid?js_string>
<script type="text/javascript">//<![CDATA[
(function()
{
   new Cggh.dashlet.Collaborations("${jsid}").setOptions(
   {
      imapEnabled: ${imapServerEnabled?string},
      listSize: 150
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
          	<option value="all" selected="selected">${msg("filter.all")}</option>
            <option value="enquiry">${msg("filter.status.enquiry")}</option>
            <option value="active">${msg("filter.status.active")}</option>
            <option value="declined">${msg("filter.status.renegotiation")}</option>
            <option value="aborted">${msg("filter.status.aborted")}</option>
         </select>
         <span class="align-left yui-button yui-menu-button" id="${id}-enquiry">
            <span class="first-child">
               <button type="button" tabindex="2">${msg("filter.all")}</button>
            </span>
         </span>
         <select id="${id}-enquiry-menu" multiple="multiple">
          	<option value="all" selected="selected">${msg("filter.all")}</option>
            <option value="enquiry email received">${msg("filter.enquiry.enquiry")}</option>
            <option value="dialogue open">${msg("filter.enquiry.dialogue")}</option>
            <option value="awaiting funding">${msg("filter.enquiry.funding")}</option>
            <option value="application form sent">${msg("filter.enquiry.form")}</option>
            <option value="application to be presented to SG">${msg("filter.enquiry.sg")}</option>
            <option value="collaboration agreement being drawn">${msg("filter.enquiry.drawn")}</option>
            <option value="collaboration agreement sent">${msg("filter.enquiry.sent")}</option>
         </select>
         <span class="align-left yui-button yui-menu-button" id="${id}-species">
            <span class="first-child">
               <button type="button" tabindex="3">${msg("filter.all")}</button>
            </span>
         </span>       
         <select id="${id}-species-menu" multiple="multiple">
          	<option value="all" selected="selected">${msg("filter.all")}</option>
            <option value="P. falciparum">${msg("filter.species.falciparum")}</option>
            <option value="P. vivax">${msg("filter.species.vivax")}</option>
            <option value="P. malariae">${msg("filter.species.malariae")}</option>
            <option value="P. all">${msg("filter.species.allP")}</option>
            <option value="A. gambiae">${msg("filter.species.gambiae")}</option>
            <option value="Human">${msg("filter.species.human")}</option>
         </select>
         <span class="align-right yui-button-align" id="${id}-lookseq">
            <span class="first-child">
            	<button type="checkbox" tabindex="4">${msg("include.lookseq")}</button>
            </span>
         </span>
         <div class="clear"></div>
      </div>
   </div>
   <div id="${id}-collaborations" class="body" <#if args.height??>style="height: ${args.height}px;"</#if>></div>
</div>