package org.cggh.repo.web.scripts.discussion;

import org.alfresco.repo.web.scripts.discussion.ForumTopicPost;

public class CustomForumTopicPost extends ForumTopicPost {

    protected Object buildPerson(String username)
    {
       return CustomForumTopicsGet.buildPersonObject(personService, username);
    }
}
