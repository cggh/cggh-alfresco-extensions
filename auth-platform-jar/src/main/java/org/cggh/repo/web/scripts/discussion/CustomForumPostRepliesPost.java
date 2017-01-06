package org.cggh.repo.web.scripts.discussion;

import org.alfresco.repo.web.scripts.discussion.ForumPostRepliesPost;

public class CustomForumPostRepliesPost extends ForumPostRepliesPost {

    protected Object buildPerson(String username)
    {
       return CustomForumTopicsGet.buildPersonObject(personService, username);
    }
    
}
