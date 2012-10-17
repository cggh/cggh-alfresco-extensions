<#macro dateFormat date>${date?string(msg("content.dateFormat"))}</#macro>

<#macro documentLink doc, content="", linkClass="">
<#local displayPath="">
<#if content == "">
   <#local content=doc.displayName>
</#if>
<#if doc.path?has_content>
   <#local displayPath=doc.path>
</#if>
<#if doc.site?has_content>
<#local siteName=doc.site.shortName>
<#if doc.type == "document">
<a href="/share/page/site/${siteName}/document-details?nodeRef=${doc.nodeRef}" title="${doc.title!""}" class="${linkClass}">${content}</a>
<#elseif doc.type == "wikipage">
<a href="/share/page/site/${siteName}/wiki-page?title=${doc.name}" title="${doc.title!""}" class="${linkClass}">${content}</a>
<#elseif doc.type == "link">
<a href="/share/page/site/${siteName}/links-view?linkId=${doc.name}" title="${doc.title!""}" class="${linkClass}">${content}</a>
<#elseif doc.type == "blogpost">
<a href="/share/page/site/${siteName}/blog-postview?container=${doc.container}&postId=${doc.name}" title="${doc.title!""}" class="${linkClass}">${content}</a>
<#elseif doc.type == "forumpost">
<a href="/share/page/site/${siteName}/discussions-topicview?container=${doc.container}&topicId=${doc.name}" title="${doc.title!""}" class="${linkClass}">${content}</a>
<#elseif doc.type == "datalistitem">
<a href="/share/page/site/${siteName}/data-lists?list=${doc.name}" title="${doc.title!""}" class="${linkClass}">${content}</a>
<#else>
<a href="/share/page/document-details?nodeRef=${doc.nodeRef}" title="${doc.title!""}" class="${linkClass}">${content}</a>
</#if>
<#else>
<a href="/share/page/document-details?nodeRef=${doc.nodeRef}" title="${doc.title!""}" class="${linkClass}">${content}</a>
</#if>
</#macro>

<#macro documentEditLink doc, content="">
<#if content == "">
   <#local content=doc.displayName>
</#if>
<#if doc.site?has_content>
<#local siteName=doc.site.shortName>
<#if doc.container == "documentLibrary">
<a href="/share/page/site/${siteName}/document-details?nodeRef=${doc.nodeRef}" title="${doc.title!""}">${content}</a>
<#else>
<a href="/share/page/document-details?nodeRef=${doc.nodeRef}" title="${doc.title!""}">${content}</a>
</#if>
<#else>
<a href="/share/page/document-details?nodeRef=${doc.nodeRef}" title="${doc.title!""}">${content}</a>
</#if>
</#macro>

<html>
<head>
<title>${msg("header.expiredContent")}</title>
<style type="text/css">
body, td, th
{
   font-family: verdana, helvetica, sans-serif;
   font-size: 0.9em;
   color: #333333;
}
table
{
   border-collapse:collapse;
}
th
{
   background-color: #f0f0f0;
}
</style>
</head>
<body>
<h1>${msg("header.expiredContent")}</h1>
<#if (results?size > 0)>
<p>${msg("message.expiredContent", person.properties.userName)}</p>
<table cellpadding="3" cellspacing="1" border="1">
<tr>
<th>${msg("label.name")}</th>
<th>${msg("label.path")}</th>
<th>${msg("label.modified")}</th>
<th>${msg("label.expiry")}</th>
<th>${msg("label.owner")}</th>
<th>${msg("label.actions")}</th>
</tr>
<#list results.items as result>
<tr>
<td><@documentLink doc=result /></td>
<td>${result.path}</td>
<td><@dateFormat result.modifiedOn /></td>
<td><@dateFormat result.to /></td>
<td>${result.owner!""}</td>
<td><@documentEditLink doc=result content=msg("action.edit") /></td>
</tr>
</#list>
</table>
<#else>
<p>${msg("message.noExpiredContent")}</p>
</#if>
</body>
