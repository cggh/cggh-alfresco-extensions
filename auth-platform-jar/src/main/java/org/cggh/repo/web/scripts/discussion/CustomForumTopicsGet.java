package org.cggh.repo.web.scripts.discussion;

import org.alfresco.repo.security.permissions.AccessDeniedException;
import org.alfresco.repo.web.scripts.discussion.ForumTopicsGet;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.security.NoSuchPersonException;
import org.alfresco.service.cmr.security.PersonService;

public class CustomForumTopicsGet extends ForumTopicsGet {

    protected Object buildPerson(String username)
    {
    	return super.buildPerson(username);
    }

}
