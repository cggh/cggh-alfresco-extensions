package org.cggh.repo.web.scripts.wiki;

import org.alfresco.repo.security.permissions.AccessDeniedException;
import org.alfresco.repo.web.scripts.wiki.WikiPageListGet;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.security.NoSuchPersonException;




public class CustomWikiPageListGet extends WikiPageListGet {
	
	
    protected NodeRef personForModel(String username)
    {
       if (username == null || username.isEmpty())
       {
          return null;
       }
       
       try
       {
          // Will turn into a Script Node needed of the person
           return personService.getPerson(username);
       }
       catch(NoSuchPersonException e)
       {
          // This is normally caused by the person having been deleted
          return null;
       }
       catch(AccessDeniedException ade) {
    	   //If the person is no longer a member of the same sites
    	   return null;
       }
    }

}
