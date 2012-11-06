{
"collaborationNodes" : [
<#list collabNodes as collab>
{
"nodeRef": "${collab.nodeRef}",
"name": "${jsonUtils.encodeJSONString(collab.name)}",
"title": "${jsonUtils.encodeJSONString(collab.properties["cm:title"])!''}",
"description": "${jsonUtils.encodeJSONString(collab.properties["cm:description"])!''}",
"type": "${collab.type}",
"collaborationStatus": "${collab.properties["cggh:collaborationStatus"]!''}",
"enquiryStatus": "${collab.properties["cggh:enquiryStatus"]!''}",
"species": [
<#list collab.properties["cggh:species"]![] as species>
 "${species}"
<#if species_has_next>,</#if>
</#list>],
"countries": [
<#list collab.properties["cggh:sampleCountry"]![] as country>
 "${country}"
<#if country_has_next>,</#if>
</#list>],
"contacts": [
<#list collab.assocs["cggh:contactList"]![] as contact>
 {
 	"name": "${jsonUtils.encodeJSONString(contact.name)!''}",
	"firstName": "${jsonUtils.encodeJSONString(contact.properties["dl:contactFirstName"])!''}",
	"lastName": "${jsonUtils.encodeJSONString(contact.properties["dl:contactLastName"])!''}",
	"company": "${jsonUtils.encodeJSONString(contact.properties["dl:contactCompany"])!''}",
	"email": "${jsonUtils.encodeJSONString(contact.properties["dl:contactEmail"])!''}",
	"phone": "${jsonUtils.encodeJSONString(contact.properties["dl:contactPhoneOffice"])!''}",
	"mobile": "${jsonUtils.encodeJSONString(contact.properties["dl:contactPhoneMobile"])!''}",
	"notes": "${jsonUtils.encodeJSONString(contact.properties["dl:contactNotes"])!''}"
}
<#if contact_has_next>,</#if>
</#list>],
<#if collab.assocs["cggh:liaison"]??>
<#list collab.assocs["cggh:liaison"]![] as lia>
"liaison": {
	"firstName": "${jsonUtils.encodeJSONString(lia.properties["cm:firstName"])!''}",
	"lastName": "${jsonUtils.encodeJSONString(lia.properties["cm:lastName"])!''}"
}
<#if lia_has_next>,</#if>
</#list>,
</#if>
"notes": "${jsonUtils.encodeJSONString(collab.properties["cggh:collaborationNotes"])!''}"
}<#if collab_has_next>,</#if>
</#list>
]
}

