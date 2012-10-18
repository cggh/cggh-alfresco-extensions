<#assign id = args.htmlid>
<#assign jsid = args.htmlid?js_string>
<script type="text/javascript">//<![CDATA[
(function()
{
   new Alfresco.dashlet.Collaborations("${jsid}").setOptions(
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
               <button type="button" tabindex="0">${msg("filter.all")}</button>
            </span>
         </span>
         <select id="${id}-status-menu" multiple="multiple">
          	<option value="all" selected="selected">${msg("filter.all")}</option>
            <option value="enquiry">${msg("filter.status.enquiry")}</option>
            <option value="exploration">${msg("filter.status.exploration")}</option>
            <option value="negotiation">${msg("filter.status.negotiation")}</option>
            <option value="active">${msg("filter.status.active")}</option>
            <option value="renegotiation">${msg("filter.status.renegotiation")}</option>
            <option value="completed">${msg("filter.status.completed")}</option>
            <option value="aborted">${msg("filter.status.aborted")}</option>
            <option value="LoS enquiry">${msg("filter.status.LoSenquiry")}</option>
            <option value="LoS exploration">${msg("filter.status.LoSexploration")}</option>
            <option value="LoS negotiation">${msg("filter.status.LoSnegotiation")}</option>
            <option value="LoS agreed">${msg("filter.status.LoSagreed")}</option>
            <option value="LoS aborted">${msg("filter.status.LoSaborted")}</option>
         </select>
         <span class="align-right yui-button-align">
            <span class="first-child">
            </span>
         </span>
         <div class="clear"></div>
      </div>
   </div>
   <div id="${id}-collaborations" class="body" <#if args.height??>style="height: ${args.height}px;"</#if>></div>
</div>