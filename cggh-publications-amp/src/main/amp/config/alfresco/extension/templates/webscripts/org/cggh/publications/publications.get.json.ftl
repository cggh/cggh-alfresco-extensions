{
"publicationNodes" : [
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
<#if collab.properties["cggh-pub:submittedDate"]??>
"submittedDate": "${jsonUtils.encodeJSONString(collab.properties["cggh-pub:submittedDate"]?string("MM-yyyy"))!''}",
</#if>
"journal": "${jsonUtils.encodeJSONString(pub.properties["cggh-pub:submittedJournal"])!''}",
"publicationStatus": "${jsonUtils.encodeJSONString(pub.properties["cggh-pub:publicationStatus"])!''}",
<#if pub.properties["cggh-pub:depositedPMC"]??>
"depositedPMC": "${pub.properties["cggh-pub:depositedPMC"]?string}",
<#else>
"depositedPMC": "false",
</#if>












<#if collab.properties["cggh:descriptionApproved"]??>
"descriptionApproved": "${collab.properties["cggh:descriptionApproved"]?string}",
<#else>
"descriptionApproved": "false",
</#if>
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
"primaryContacts": [
<#list collab.assocs["cggh:primaryContactList"]![] as contact>
 {
    "nodeRef": "${jsonUtils.encodeJSONString(contact.nodeRef)!''}",
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
<#-- Not enabled in content model yet
"groupPI": [
<#list collab.assocs["cggh:groupPI"]![] as pi>
<#list pi.children as myPerson>
{
    "firstName": "${jsonUtils.encodeJSONString(myPerson.properties["cm:firstName"])!''}",
    "lastName": "${jsonUtils.encodeJSONString(myPerson.properties["cm:lastName"])!''}",
    "company": "${jsonUtils.encodeJSONString(myPerson.properties["cm:organization"])!''}",
    "email": "${jsonUtils.encodeJSONString(myPerson.properties["cm:email"])!''}",
    "nodeRef": "${jsonUtils.encodeJSONString(myPerson.properties["sys:node-uuid"])!''}"
}
<#if myPerson_has_next>,</#if>
</#list>
</#list>],
-->
"contacts": [
<#list collab.assocs["cggh:contactList"]![] as contact>
 {
    "nodeRef": "${jsonUtils.encodeJSONString(contact.nodeRef)!''}",
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
"associates": [
<#list collab.assocs["cggh:associates"]![] as contact>
 {
    "nodeRef": "${jsonUtils.encodeJSONString(contact.nodeRef)!''}",
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
<#if collab.assocs["cggh:webStudy"]??>
<#list collab.assocs["cggh:webStudy"]![] as webStudy>
"webStudy": {
    "nodeRef": "${webStudy.nodeRef}",
    "name": "${jsonUtils.encodeJSONString(webStudy.name)}",
    "title": "${jsonUtils.encodeJSONString(webStudy.properties["cm:title"])!''}",
    "legacyID": "${jsonUtils.encodeJSONString(webStudy.properties["cggh:legacyID"])!''}"
}
<#if webStudy_has_next>,</#if>
</#list>,
</#if>
"publications": [
<#if collab.assocs["cggh:publications"]??>
<#list collab.assocs["cggh:publications"]![] as pub>
{
    "nodeRef": "${pub.nodeRef}",
    "name": "${jsonUtils.encodeJSONString(pub.name)}",
    "title": "${jsonUtils.encodeJSONString(pub.properties["cm:title"])!''}",
    "doi": "${jsonUtils.encodeJSONString(pub.properties["cggh:DOI"])!''}",
    "pmid": "${jsonUtils.encodeJSONString(pub.properties["cggh:PMID"])!''}",
    "citation": "${jsonUtils.encodeJSONString(pub.properties["cggh:citationText"])!''}"
}
<#if pub_has_next>,</#if>
</#list>
</#if>],
"projects": [
<#if collab.assocs["cggh:projects"]??>
<#list collab.assocs["cggh:projects"]![] as project>
{
    "nodeRef": "${project.nodeRef}",
<#attempt>
    "name": "${jsonUtils.encodeJSONString(project.name)}",
    "title": "${jsonUtils.encodeJSONString(project.properties["cm:title"])!''}",
    "description": "${jsonUtils.encodeJSONString(project.properties["cm:description"])!''}"
<#recover>
    "name": "Unknown",
    "title": "Unknown",
    "description": "Access denied"
</#attempt>
}
<#if project_has_next>,</#if>
</#list>

</#if>],
<#if collab.assocs["cggh:liaison"]??>
<#list collab.assocs["cggh:liaison"]![] as lia>
"liaison": {
	"firstName": "${jsonUtils.encodeJSONString(lia.properties["cm:firstName"])!''}",
	"lastName": "${jsonUtils.encodeJSONString(lia.properties["cm:lastName"])!''}"
}
<#if lia_has_next>,</#if>
</#list>,
</#if>
"notes": "${jsonUtils.encodeJSONString(collab.properties["cggh:collaborationNotes"])!''}",
"samplesExpected": "${jsonUtils.encodeJSONString(collab.properties["cggh:samplesExpected"])!''}",
<#if collab.properties["cggh:firstSample"]??>
"firstSampleDate": "${jsonUtils.encodeJSONString(collab.properties["cggh:firstSample"]?string("MM-yyyy"))!''}",
</#if>
<#if collab.properties["cggh:lastSample"]??>
"lastSampleDate": "${jsonUtils.encodeJSONString(collab.properties["cggh:lastSample"]?string("MM-yyyy"))!''}",
</#if>
"strategicNature": "${jsonUtils.encodeJSONString(collab.properties["cggh:strategicNature"])!''}",
"intDescrip": "${jsonUtils.encodeJSONString(collab.properties["cggh:internalDescription"])!''}",
<#if collab.properties["cggh:reviewed"]??>
"reviewed": "${jsonUtils.encodeJSONString(collab.properties["cggh:reviewed"]?string("dd-MM-yyyy"))!''}",
</#if>
"modified": "${jsonUtils.encodeJSONString(collab.properties["cm:modified"]?string("dd-MM-yyyy HH:mm:ss"))!''}"
}<#if collab_has_next>,</#if>
</#list>
]
}

