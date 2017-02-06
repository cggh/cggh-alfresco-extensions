{
<#if searchTerm??>
"searchTerm": "${jsonUtils.encodeJSONString(searchTerm)}",
</#if>
"collaborationNodes" : [
<#list collabNodes as collab>
{
"nodeRef": "${collab.nodeRef}",
"name": "${jsonUtils.encodeJSONString(collab.name)}",
"title": "${jsonUtils.encodeJSONString(collab.properties["cm:title"])!''}",
"legacyID": "${jsonUtils.encodeJSONString(collab.properties["cggh:legacyID"])!''}",
"webTitle": "${jsonUtils.encodeJSONString(collab.properties["cggh:webTitle"])!''}",
"description": "${jsonUtils.encodeJSONString(collab.properties["cm:description"])!''}",
<#if collab.properties["cggh:webTitleApproved"]??>
"webTitleApproved": "${collab.properties["cggh:webTitleApproved"]?string}",
<#else>
"webTitleApproved": "false",
</#if>
<#if collab.properties["cggh:descriptionApproved"]??>
"descriptionApproved": "${collab.properties["cggh:descriptionApproved"]?string}",
<#else>
"descriptionApproved": "false",
</#if>
"type": "${collab.type}",
"collaborationStatus": "${collab.properties["cggh:collaborationStatus"]!''}",
"enquiryStatus": "${collab.properties["cggh:enquiryStatus"]!''}",
"ragStatus": "${collab.properties["cggh:ragStatus"]!''}",
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
"collaborationDoc": [
<#list collab.assocs["cggh:collaborationDoc"]![] as collaborationDoc>
 {
 	"nodeRef": "${jsonUtils.encodeJSONString(collaborationDoc.nodeRef)!''}",
    "name": "${jsonUtils.encodeJSONString(collaborationDoc.name)!''}"
}
<#if collaborationDoc_has_next>,</#if>
</#list>],
"groupPI": [
<#list collab.assocs["cggh:groupPI"]![] as pi>
<#list pi.children as myPerson>
<#if myPerson.properties["cm:userName"] != "pwmTestUser" || pi.children?size gt 1 >
{
    "malariagenUID": "${jsonUtils.encodeJSONString(myPerson.properties["cm:userName"])!''}",
    "firstName": "${jsonUtils.encodeJSONString(myPerson.properties["cm:firstName"])!''}",
    "lastName": "${jsonUtils.encodeJSONString(myPerson.properties["cm:lastName"])!''}",
    "email": "${jsonUtils.encodeJSONString(myPerson.properties["cm:email"])!''}"
}
<#if myPerson_has_next>,</#if>
</#if>
</#list>
</#list>],

"groupData": [
<#list collab.assocs["cggh:groupData"]![] as data>
<#list data.children as myPerson>
<#if myPerson.properties["cm:userName"] != "pwmTestUser" || data.children?size gt 1>
{
    "malariagenUID": "${jsonUtils.encodeJSONString(myPerson.properties["cm:userName"])!''}",
    "firstName": "${jsonUtils.encodeJSONString(myPerson.properties["cm:firstName"])!''}",
    "lastName": "${jsonUtils.encodeJSONString(myPerson.properties["cm:lastName"])!''}",
    "email": "${jsonUtils.encodeJSONString(myPerson.properties["cm:email"])!''}"
}
<#if myPerson_has_next>,</#if>
</#if>
</#list>
</#list>],
"groupMail": [
<#list collab.assocs["cggh:groupMail"]![] as mail>
<#list mail.children as myPerson>
<#if myPerson.properties["cm:userName"] != "pwmTestUser" || mail.children?size gt 1 >
{
    "malariagenUID": "${jsonUtils.encodeJSONString(myPerson.properties["cm:userName"])!''}",
    "firstName": "${jsonUtils.encodeJSONString(myPerson.properties["cm:firstName"])!''}",
    "lastName": "${jsonUtils.encodeJSONString(myPerson.properties["cm:lastName"])!''}",
    "email": "${jsonUtils.encodeJSONString(myPerson.properties["cm:email"])!''}"
}
<#if myPerson_has_next>,</#if>
</#if>
</#list>
</#list>],
"groupPublic": [
<#list collab.assocs["cggh:groupPublic"]![] as pub>
<#list pub.children as myPerson>
<#if myPerson.properties["cm:userName"] != "pwmTestUser" || pub.children?size gt 1 >
{
    "malariagenUID": "${jsonUtils.encodeJSONString(myPerson.properties["cm:userName"])!''}",
    "firstName": "${jsonUtils.encodeJSONString(myPerson.properties["cm:firstName"])!''}",
    "lastName": "${jsonUtils.encodeJSONString(myPerson.properties["cm:lastName"])!''}",
    "email": "${jsonUtils.encodeJSONString(myPerson.properties["cm:email"])!''}"
}
<#if myPerson_has_next>,</#if>
</#if>
</#list>
</#list>],
"groupContact": [
<#list collab.assocs["cggh:groupContact"]![] as contact>
<#list contact.children as myPerson>
<#if myPerson.properties["cm:userName"] != "pwmTestUser" || contact.children?size gt 1 >
{
    "malariagenUID": "${jsonUtils.encodeJSONString(myPerson.properties["cm:userName"])!''}",
    "firstName": "${jsonUtils.encodeJSONString(myPerson.properties["cm:firstName"])!''}",
    "lastName": "${jsonUtils.encodeJSONString(myPerson.properties["cm:lastName"])!''}",
    "email": "${jsonUtils.encodeJSONString(myPerson.properties["cm:email"])!''}"
}
<#if myPerson_has_next>,</#if>
</#if>
</#list>
</#list>],
"groupNotPublic": [
<#list collab.assocs["cggh:groupNotPublic"]![] as notPublic>
<#list notPublic.children as myPerson>
<#if myPerson.properties["cm:userName"] != "pwmTestUser" || notPublic.children?size gt 1 >
{
    "malariagenUID": "${jsonUtils.encodeJSONString(myPerson.properties["cm:userName"])!''}",
    "firstName": "${jsonUtils.encodeJSONString(myPerson.properties["cm:firstName"])!''}",
    "lastName": "${jsonUtils.encodeJSONString(myPerson.properties["cm:lastName"])!''}",
    "email": "${jsonUtils.encodeJSONString(myPerson.properties["cm:email"])!''}"
}
<#if myPerson_has_next>,</#if>
</#if>
</#list>
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
<#if collab.assocs["cggh:projectsdl"]??>
<#list collab.assocs["cggh:projectsdl"]![] as project>
{
    "name": "${jsonUtils.encodeJSONString(project.name)}"
}
<#if project_has_next>,</#if>
</#list>
</#if>],
<#if collab.assocs["cggh:liaison"]??>
<#list collab.assocs["cggh:liaison"]![] as lia>
"liaison": {
        "malariagenUID": "${jsonUtils.encodeJSONString(lia.properties["cm:userName"])!''}",
	"firstName": "${jsonUtils.encodeJSONString(lia.properties["cm:firstName"])!''}",
	"lastName": "${jsonUtils.encodeJSONString(lia.properties["cm:lastName"])!''}"
}
<#if lia_has_next>,</#if>
</#list>,
</#if>
"notes": "${jsonUtils.encodeJSONString(collab.properties["cggh:collaborationNotes"])!''}",
"samplesExpected": "${jsonUtils.encodeJSONString(collab.properties["cggh:samplesExpected"])!''}",
"samplesProcessed": "${jsonUtils.encodeJSONString(collab.properties["cggh:samplesProcessed"])!''}",
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
<#if collab.properties["cggh:nextReview"]??>
"nextReview": "${jsonUtils.encodeJSONString(collab.properties["cggh:nextReview"]?string("dd-MM-yyyy"))!''}",
</#if>
"modified": "${jsonUtils.encodeJSONString(collab.properties["cm:modified"]?string("dd-MM-yyyy HH:mm:ss"))!''}"
}<#if collab_has_next>,</#if>
</#list>
]
}

