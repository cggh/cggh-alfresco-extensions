package org.cggh.repo.web.scripts.discussion;

import org.alfresco.repo.web.scripts.discussion.ForumPostPut;

public class CustomForumPostPut extends ForumPostPut {

    protected Object buildPerson(String username)
    {
    	return super.buildPerson(username);
    }

    
}
