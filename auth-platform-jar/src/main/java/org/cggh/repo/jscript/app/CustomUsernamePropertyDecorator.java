package org.cggh.repo.jscript.app;

import java.io.Serializable;

import org.alfresco.repo.jscript.app.UsernamePropertyDecorator;
import org.alfresco.repo.security.permissions.AccessDeniedException;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.security.NoSuchPersonException;
import org.alfresco.service.namespace.QName;
import org.json.simple.JSONAware;
import org.json.simple.JSONObject;

public class CustomUsernamePropertyDecorator extends UsernamePropertyDecorator {

    /**
     * @see org.alfresco.repo.jscript.app.PropertyDecorator#decorate(QName, org.alfresco.service.cmr.repository.NodeRef, java.io.Serializable)
     */
    @SuppressWarnings("unchecked")
    public JSONAware decorate(QName propertyName, NodeRef nodeRef, Serializable value) {
    	JSONObject map;
    	
    	try 
    	{
    		map = (JSONObject) super.decorate(propertyName, nodeRef, value);
    	} catch (NoSuchPersonException | AccessDeniedException ade) {
    		map = new JSONObject();
    		String firstName = null;
  	        String lastName = null;

    	    //TODO - better approach at least I18N
    	    firstName = "Unknown";
    	    lastName = "User";
    		map.put("firstName", firstName);
    		map.put("lastName", lastName);
    		map.put("displayName", ((firstName != null ? firstName + " " : "") + (lastName != null ? lastName : ""))
    			.replaceAll("^\\s+|\\s+$", ""));

    	}
    	return map;
    }

}
