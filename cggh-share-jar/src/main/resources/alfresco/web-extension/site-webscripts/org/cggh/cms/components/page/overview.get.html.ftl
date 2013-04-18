<#assign id = args.htmlid>
<#assign jsid = args.htmlid?js_string>
<script type="text/javascript">//<![CDATA[
(function()
{
   new Cggh.dashlet.Overview("${jsid}").setOptions(
   {
    
   }).setMessages(${messages});
   new Alfresco.widget.DashletResizer("${jsid}", "${instance.object.id}");
})();
//]]></script>

<div class="dashlet overview">
   <span class="align-right yui-button-align hidden" id="${id}-lookseq">
            <span class="first-child">
                <button type="checkbox" tabindex="4">${msg("include.lookseq")}</button>
            </span>
         </span>
   <div id="${id}-overview"></div>
</div>