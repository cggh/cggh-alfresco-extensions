package org.cggh.repo.web.scripts.wiki;

import org.alfresco.repo.security.permissions.AccessDeniedException;
import org.alfresco.service.cmr.repository.NodeRef;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

privileged aspect PersonForModel {

	private static Log logger = LogFactory.getLog(PersonForModel.class);

	pointcut personForModel(String username) : 
	    execution(protected NodeRef org.alfresco.repo.web.scripts.wiki.AbstractWikiWebScript+.personForModel(String))
	    && args(username);

	NodeRef around(String username): personForModel(username) {
		// Empty string needed if the user can't be found
		NodeRef noSuchPersonResponse = null;
		if (logger.isDebugEnabled()) {
			Object[] args = thisJoinPoint.getArgs();
			logger.debug("personForModel aspect:" + thisJoinPoint.getSignature() + " " + args[0]);
		}
		NodeRef ret = null;
		try {
			ret = proceed(username);
		} catch (AccessDeniedException ade) {
			// If the person is no longer a member of the same sites
			return noSuchPersonResponse;
		}
		return ret;
	}

}
