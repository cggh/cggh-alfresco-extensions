[
<#list publicationNodes as pub>
{
"nodeRef": "${pub.nodeRef}",
"name": "${jsonUtils.encodeJSONString(pub.name)}",
"title": "${jsonUtils.encodeJSONString(pub.properties["cm:title"])!''}",
"type": "${jsonUtils.encodeJSONString(pub.properties["cggh-pub:type"])!''}",
"lead": "${jsonUtils.encodeJSONString(pub.properties["cggh-pub:lead"])!''}",
"categories": [
<#list pub.properties["cggh-pub:category"]![] as category>
 "${category}"
<#if category_has_next>,</#if>
</#list>],
<#if pub.properties["cggh-pub:onProdSchedule"]??>
"onProdSchedule": "${pub.properties["cggh-pub:onProdSchedule"]?string}",
<#else>
"onProdSchedule": "false",
</#if>
"pubTitle": "${jsonUtils.encodeJSONString(pub.properties["cggh-pub:pubTitle"])!''}",
"contacts": [
<#list pub.assocs["cggh-pub:leadContact"]![] as contact>
 {
    "nodeRef": "${jsonUtils.encodeJSONString(contact.nodeRef)!''}",
    "firstName": "${jsonUtils.encodeJSONString(contact.properties["cm:firstName"])!''}",
    "lastName": "${jsonUtils.encodeJSONString(contact.properties["cm:lastName"])!''}",
    "company": "${jsonUtils.encodeJSONString(contact.properties["cm:organization"])!''}",
    "email": "${jsonUtils.encodeJSONString(contact.properties["cm:email"])!''}",
    "phone": "${jsonUtils.encodeJSONString(contact.properties["cm:telephone"])!''}"
}
<#if contact_has_next>,</#if>
</#list>],
"fundingCodes": "${jsonUtils.encodeJSONString(pub.properties["cggh-pub:fundingCodes"])!''}",
<#if pub.properties["cggh-pub:submittedPubComm"]??>
"submittedPubComm": "${pub.properties["cggh-pub:submittedPubComm"]?string}",
<#else>
"submittedPubComm": "false",
</#if>
<#if pub.properties["cggh-pub:reviewedDK"]??>
"reviewedDK": "${pub.properties["cggh-pub:reviewedDK"]?string}",
<#else>
"reviewedDK": "false",
</#if>
<#if pub.properties["cggh-pub:submittedDate"]??>
"submittedDate": "${jsonUtils.encodeJSONString(collab.properties["cggh-pub:submittedDate"]?string("MM-yyyy"))!''}",
</#if>
"journal": "${jsonUtils.encodeJSONString(pub.properties["cggh-pub:submittedJournal"])!''}",
"publicationStatus": "${jsonUtils.encodeJSONString(pub.properties["cggh-pub:publicationStatus"])!''}",
<#if pub.properties["cggh-pub:depositedPMC"]??>
"depositedPMC": "${pub.properties["cggh-pub:depositedPMC"]?string}",
<#else>
"depositedPMC": "false",
</#if>
}<#if pub_has_next>,</#if>
</#list>
]

