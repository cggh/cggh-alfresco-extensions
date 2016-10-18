package org.cggh.repo.jscript.app;

import java.io.Serializable;

import org.alfresco.repo.security.permissions.AccessDeniedException;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.jscript.app.UsernamePropertyDecorator;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.namespace.QName;
import org.json.simple.JSONAware;
import org.json.simple.JSONObject;

public class CustomUsernamePropertyDecorator extends UsernamePropertyDecorator {
    /** Person service */
    private PersonService personService = null;

    /**
     * @param personService
     *            person service
     */
    public void setPersonService(PersonService personService) {
	this.personService = personService;
    }

    /**
     */
    @SuppressWarnings("unchecked")
    public JSONAware decorate(QName propertyName, NodeRef nodeRef, Serializable value) {
	String username = value.toString();
	String firstName = null;
	String lastName = null;
	JSONObject map = new JSONObject();
	map.put("userName", username);

	try
	{
	    if (this.personService.personExists(username))
	    {
		NodeRef personRef = this.personService.getPerson(username, false);
		firstName = (String) this.nodeService.getProperty(personRef, ContentModel.PROP_FIRSTNAME);
		lastName = (String) this.nodeService.getProperty(personRef, ContentModel.PROP_LASTNAME);
	    } else if (username.equals("System") || username.startsWith("System@"))
	    {
		firstName = "System";
		lastName = "User";
	    } else
	    {
		map.put("isDeleted", true);
		return map;
	    }
	} catch (AccessDeniedException ade)
	{
	    //TODO - better approach at least I18N
	    firstName = "Unknown";
	    lastName = "User";
		
	} 
	map.put("firstName", firstName);
	map.put("lastName", lastName);
	map.put("displayName", ((firstName != null ? firstName + " " : "") + (lastName != null ? lastName : ""))
		.replaceAll("^\\s+|\\s+$", ""));
	return map;
    }

}
