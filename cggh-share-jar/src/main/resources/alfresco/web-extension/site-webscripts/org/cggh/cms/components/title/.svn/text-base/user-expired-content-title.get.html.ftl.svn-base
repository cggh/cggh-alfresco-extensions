<div class="page-title theme-bg-color-1 theme-border-1">
<#if allUsers?exists && allUsers == true>
   <h1 class="theme-color-3"><span>${msg("header.allExpiredContent")}</span></h1>
<#else>
   <#assign userName>${profile.properties["firstName"]?html} <#if profile.properties["lastName"]??>${profile.properties["lastName"]?html}</#if></#assign>
   <h1 class="theme-color-3">${msg("header.expiredContent", "<span>${userName}</span>")}</h1>
</#if>
</div>