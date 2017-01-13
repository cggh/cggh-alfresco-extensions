package org.cggh.alfresco.repo.activities;

import org.alfresco.repo.security.permissions.AccessDeniedException;
import org.alfresco.repo.security.person.PersonServiceImpl;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.repo.activities.ActivityServiceImpl;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public aspect ActivityServiceAspect {
//within getUserAvatarNodeRef, getSiteFeedEntries, 
	//getUserAvatarNodeRef - I think is unused
	
	private static Log logger = LogFactory.getLog(ActivityServiceAspect.class);
	
	/**
	 * This doesn't work because it is called too soon
	 * left here because it's interesting...
	 * 
	 * See also src/main/resources/aop.xml
	 */
	pointcut activityServiceMethods():
		execution(* org.alfresco.repo.activities.ActivityServiceImpl.*(..));
		
	pointcut personService(String userId) :
		execution(* org.alfresco.service.cmr.security.PersonService+.getPerson(String))
		&& (cflowbelow(execution(* org.alfresco.repo.activities.ActivityServiceImpl.getUserFeedEntries(..)) ||
				execution(* org.alfresco.repo.activities.ActivityServiceImpl.getSiteFeedEntries(..)) ||
				execution(* org.alfresco.repo.activities.ActivityServiceImpl.getUserAvatarNodeRef(..)) ))
		&& !within(ActivityServiceAspect)
		&& args(userId);

	NodeRef around(String userId): personService(userId) {
		// Empty string needed if the user can't be found
		NodeRef noSuchPersonResponse = null;
		Object[] args = thisJoinPoint.getArgs();
//		final String userId = (String) args[0];
		if (logger.isDebugEnabled()) {
			
			logger.debug("personService aspect:" + thisJoinPoint.getSignature() + " " + args[0]);
		}
//		System.out.println("personService aspect:" + thisJoinPoint.getSignature() + " " + userId);
//		System.out.println("static part:" + thisEnclosingJoinPointStaticPart.getSignature().getDeclaringType());

		NodeRef ret = null;
		try {
			ret = proceed(userId);
		} catch (net.sf.acegisecurity.AccessDeniedException ade) {
			
//			System.out.println("Caught Exception");
			// If the person is no longer a member of the same sites
			return noSuchPersonResponse;
		} 
//		System.out.println("NodeRef:" + ret);
		return ret;
	}
	
}
