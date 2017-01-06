package org.cggh.repo.web.scripts.discussion;

import org.alfresco.repo.web.scripts.discussion.ForumPostRepliesGet;

public class CustomForumPostRepliesGet extends ForumPostRepliesGet {

    protected Object buildPerson(String username)
    {
       return CustomForumTopicsGet.buildPersonObject(personService, username);
    }
    
}
