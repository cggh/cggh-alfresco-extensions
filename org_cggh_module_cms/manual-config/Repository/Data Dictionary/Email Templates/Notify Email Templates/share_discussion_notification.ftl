A new post is available in the '${document.parent.childAssocs["cm:contains"][0].properties.title}' discussion in the '${document.parent.parent.parent.properties.name}' site, it was added by ${person.properties.firstName}<#if person.properties.lastName?exists> ${person.properties.lastName}</#if>:

Read and reply here: https://alfresco.cggh.org/share/page/site/${document.parent.parent.parent.properties.name}/discussions-topicview?topicId=${document.parent.children[0].name}&listViewLinkBack=true

---

${document.content?replace("</?[^>]+(>|$)", "", "r")}

