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

<div class="dashlet overview" style="height: 660px;">
   
   <div class="toolbar flat-button" style="z-index:5;">
      <div class="hidden">
         <span class="align-left yui-button yui-menu-button" id="${id}-project-select">
            <span class="first-child">
               <button type="button" tabindex="0">${msg("filter.project")}</button>
            </span>
         </span>
          <select id="${id}-project-select-menu">
            <option value="all">${msg("filter.all")}</option>
            <option value="swsp">${msg("filter.all")}</option>
         </select>
         <span class="align-right yui-button-align hidden" id="${id}-lookseq">
            <span class="first-child">
                <button type="checkbox" tabindex="4">${msg("include.lookseq")}</button>
            </span>
         </span>
      </div>
   </div>
   
    <div id="${id}-tabview" class="yui-navset">
        <ul class="yui-nav">
            <li class="selected"><a href="#tab1"><em>${msg("studies")}</em></a></li>
            <li><a href="#tab2"><em>${msg("projects")}</em></a></li>
        </ul>            
        <div class="yui-content">
            <div id="tab1"><div id="${id}-overview"></div></div>
            <div id="tab2"><div id="${id}-projects"></div>
        </div>
   
   </div>

</div>