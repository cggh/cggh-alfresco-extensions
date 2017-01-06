package org.cggh.repo.web.scripts.discussion;

import org.alfresco.repo.web.scripts.discussion.ForumPostGet;

public class CustomForumPostGet extends ForumPostGet {

    protected Object buildPerson(String username)
    {
       return CustomForumTopicsGet.buildPersonObject(personService, username);
    }
}
