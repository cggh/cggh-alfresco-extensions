package org.cggh.alfresco.repo.activities;

import org.alfresco.repo.security.permissions.AccessDeniedException;
import org.alfresco.repo.security.person.PersonServiceImpl;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.security.PersonService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public aspect ActivitityServiceImpl {
//within getUserAvatarNodeRef, getSiteFeedEntries, 
	//getUserAvatarNodeRef - I think is unused
	
	private static Log logger = LogFactory.getLog(ActivitityServiceImpl.class);
	
	
	pointcut personService(String userId) : 
	    call(NodeRef PersonServiceImpl+.getPerson(String))
	    && within(org.alfresco.repo.activities.ActivitityServiceImpl)
	    && args(userId);

	NodeRef around(String userId): personService(userId) {
		// Empty string needed if the user can't be found
		NodeRef noSuchPersonResponse = null;
		if (logger.isDebugEnabled()) {
			Object[] args = thisJoinPoint.getArgs();
			logger.debug("personService aspect:" + thisJoinPoint.getSignature() + " " + args[0]);
		}
		System.out.println("personService aspect:" + thisJoinPoint.getSignature() + " " + userId);
		NodeRef ret = null;
		try {
			ret = proceed(userId);
		} catch (AccessDeniedException ade) {
			// If the person is no longer a member of the same sites
			return noSuchPersonResponse;
		}
		return ret;
	}
}
