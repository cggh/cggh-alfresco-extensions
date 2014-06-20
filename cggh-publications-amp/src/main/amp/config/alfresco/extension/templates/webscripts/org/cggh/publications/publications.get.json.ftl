[
<#list publicationNodes as pub>
{
"nodeRef": "${pub.nodeRef}",
"name": "${jsonUtils.encodeJSONString(pub.name)}",
"title": "${jsonUtils.encodeJSONString(pub.properties["cm:title"])!''}",
"type": "${jsonUtils.encodeJSONString(pub.properties["cgghPub:type"])!''}",
"lead": "${jsonUtils.encodeJSONString(pub.properties["cgghPub:lead"])!''}",
"categories": [
<#list pub.properties["cgghPub:category"]![] as category>
 "${category}"
<#if category_has_next>,</#if>
</#list>],
<#if pub.properties["cgghPub:onProdSchedule"]??>
"onProdSchedule": "${pub.properties["cgghPub:onProdSchedule"]?string}",
<#else>
"onProdSchedule": "false",
</#if>
"contacts": [
<#list pub.assocs["cgghPub:leadContact"]![] as contact>
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
"fundingCodes": "${jsonUtils.encodeJSONString(pub.properties["cgghPub:fundingCodes"])!''}",
<#if pub.properties["cgghPub:submittedPubComm"]??>
"submittedPubComm": "${pub.properties["cgghPub:submittedPubComm"]?string}",
<#else>
"submittedPubComm": "false",
</#if>
<#if pub.properties["cgghPub:reviewedDK"]??>
"reviewedDK": "${pub.properties["cgghPub:reviewedDK"]?string}",
<#else>
"reviewedDK": "false",
</#if>
<#if pub.properties["cgghPub:submittedDate"]??>
"submittedDate": "${jsonUtils.encodeJSONString(collab.properties["cgghPub:submittedDate"]?string("MM-yyyy"))!''}",
</#if>
"journal": "${jsonUtils.encodeJSONString(pub.properties["cgghPub:submittedJournal"])!''}",
"publicationStatus": "${jsonUtils.encodeJSONString(pub.properties["cgghPub:publicationStatus"])!''}",
<#if pub.properties["cgghPub:depositedPMC"]??>
"depositedPMC": "${pub.properties["cgghPub:depositedPMC"]?string}",
<#else>
"depositedPMC": "false",
</#if>
}<#if pub_has_next>,</#if>
</#list>
]

