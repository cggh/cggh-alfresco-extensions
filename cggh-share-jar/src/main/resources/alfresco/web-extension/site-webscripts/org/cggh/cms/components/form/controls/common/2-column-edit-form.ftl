<#import "/org/alfresco/components/form/form.lib.ftl" as formLib />
<script type="text/javascript">
   /* 
    function isFormContainer(e) {
        ret = YAHOO.util.Dom.hasClass(e, 'form-container');
        return (ret);
    }    
    var form_container0 = YAHOO.util.Dom.getElementsByClassName('form-container', 'div');
    var form_container1 = YAHOO.util.Dom.getElementBy(isFormContainer, 'div');
    var form_container2 = document.querySelectorAll(".form-container");
    var name = document.getElementsByName("prop_cm_name")[0];
    var form_container = name.parentNode.parentNode.parentNode.parentNode;
    alert(form_container);
    YAHOO.util.Dom.setStyle(form_container, 'width', "80em"); 
    */
</script>
<#if error?exists>
   <div class="error">${error}</div>
<#elseif form?exists>

   <#assign formId=args.htmlid + "-form">
   <#assign formUI><#if args.formUI??>${args.formUI}<#else>true</#if></#assign>

   <#if formUI == "true">
      <@formLib.renderFormsRuntime formId=formId />
   </#if>
   
   <div id="${formId}-container" class="form-container">
      
      <#if form.showCaption?exists && form.showCaption>
         <div id="${formId}-caption" class="caption"><span class="mandatory-indicator">*</span>${msg("form.required.fields")}</div>
      </#if>
         
      <#if form.mode != "view">
         <form id="${formId}" method="${form.method}" accept-charset="utf-8" enctype="${form.enctype}" action="${form.submissionUrl}">
      </#if>
      
      <div id="${formId}-fields" class="form-fields"> 
        <#list form.structure as item>
            <#if item.kind == "set">
               <@renderSetWithColumns set=item />
            <#else>
               <@formLib.renderField field=form.fields[item.id] />
            </#if>
         </#list>
      </div>
         
      <#if form.mode != "view">
         <@formLib.renderFormButtons formId=formId />
         </form>
      </#if>

   </div>
</#if>

<#macro renderSetWithColumns set>
   <#if set.appearance?exists>
      <#if set.appearance == "fieldset">
         <fieldset><legend>${set.label}</legend>
      <#elseif set.appearance == "panel">
         <div class="form-panel">
            <div class="form-panel-heading">${set.label}</div>
            <div class="form-panel-body">
      </#if>
   </#if>
   
   <#list set.children as item>
      <#if item.kind == "set">
         <@renderSetWithColumns set=item />
      <#else>
         <#if (item_index % 2) == 0>
         <div class="yui-g"><div class="yui-u first">
         <#else>
         <div class="yui-u">
         </#if>
         <@formLib.renderField field=form.fields[item.id] />
         </div>
         <#if ((item_index % 2) != 0) || !item_has_next></div></#if>
      </#if>
   </#list>
   
   <#if set.appearance?exists>
      <#if set.appearance == "fieldset">
         </fieldset>
      <#elseif set.appearance == "panel">
            </div>
         </div>
      </#if>
   </#if>
</#macro>