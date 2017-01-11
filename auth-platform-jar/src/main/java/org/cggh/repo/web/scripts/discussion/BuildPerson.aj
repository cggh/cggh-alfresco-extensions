package org.cggh.repo.web.scripts.discussion;

import org.alfresco.repo.security.permissions.AccessDeniedException;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

privileged aspect BuildPerson {

	private static Log logger = LogFactory.getLog(BuildPerson.class);

	pointcut buildPersonMethod(String username) : 
	    execution(protected Object org.alfresco.repo.web.scripts.discussion.AbstractDiscussionWebScript+.buildPerson(String))
	    && args(username);

	Object around(String username): buildPersonMethod(username) {
		// Empty string needed if the user can't be found
		Object noSuchPersonResponse = "";
		if (logger.isDebugEnabled()) {
			Object[] args = thisJoinPoint.getArgs();
			logger.debug("BuildPerson aspect:" + thisJoinPoint.getSignature() + " " + args[0]);
		}
		Object ret = null;
		try {
			ret = proceed(username);
		} catch (AccessDeniedException ade) {
			// If the person is no longer a member of the same sites
			return noSuchPersonResponse;
		}
		return ret;
	}

}
