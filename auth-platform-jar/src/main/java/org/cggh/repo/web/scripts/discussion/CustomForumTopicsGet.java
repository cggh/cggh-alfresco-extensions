package org.cggh.repo.web.scripts.discussion;

import org.alfresco.repo.security.permissions.AccessDeniedException;
import org.alfresco.repo.web.scripts.discussion.ForumTopicsGet;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.security.NoSuchPersonException;
import org.alfresco.service.cmr.security.PersonService;

public class CustomForumTopicsGet extends ForumTopicsGet {

    protected Object buildPerson(String username)
    {
       return CustomForumTopicsGet.buildPersonObject(personService, username);
    }

	
	static Object buildPersonObject(PersonService personService, String username) {
		// Empty string needed if the user can't be found
		   Object noSuchPersonResponse = "";

		   if (username == null || username.length() == 0)
		   {
		      return noSuchPersonResponse;
		   }

		   try
		   {
		      // Will turn into a Script Node needed of the person
		      NodeRef person = personService.getPerson(username);
		      return person;
		   }
		   catch(NoSuchPersonException e)
		   {
		      // This is normally caused by the person having been deleted
		      return noSuchPersonResponse;
		   }
		   catch(AccessDeniedException ade) {
			   //If the person is no longer a member of the same sites
			   return noSuchPersonResponse;
		   }
	}

}
