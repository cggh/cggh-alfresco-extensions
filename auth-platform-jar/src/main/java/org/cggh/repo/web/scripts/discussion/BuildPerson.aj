package org.cggh.repo.web.scripts.discussion;

import org.alfresco.repo.security.permissions.AccessDeniedException;

privileged aspect BuildPerson {

	pointcut buildPersonMethod(String username) : 
	    execution(protected Object CustomForum*.buildPerson(String))
	    && args(username);
	
	Object around(String username): buildPersonMethod(username) {
		// Empty string needed if the user can't be found
		Object noSuchPersonResponse = "";
		//Object[] args = thisJoinPoint.getArgs();
		//System.out.println("BuildPerson aspect:" + thisJoinPoint.getSignature() + " " + args[0]);
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
