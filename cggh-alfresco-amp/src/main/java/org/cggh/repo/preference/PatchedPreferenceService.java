package org.cggh.repo.preference;

import java.io.Serializable;

import org.alfresco.repo.preference.PreferenceServiceImpl;
import org.alfresco.repo.security.permissions.AccessDeniedException;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class PatchedPreferenceService extends PreferenceServiceImpl {
	Log logger = LogFactory.getLog(PatchedPreferenceService.class);
	
	@Override
	public Serializable getPreference(String userName, String preferenceName) {
		/* Patch https://issues.alfresco.com/jira/browse/MNT-10835
		 *  org.alfresco.repo.security.permissions.AccessDeniedException: 03160433 
                 * The current user xxx does not have sufficient permissions to get the preferences of the user xxx@xxx
		 *  
		 */
		if ("locale".equalsIgnoreCase(preferenceName)){
			try{
				return super.getPreference(userName, preferenceName);
			}catch (AccessDeniedException ex){
				logger.warn("ignoring AccessDeniedException while trying to resolve locale-preference", ex);
				return null;
			}
		}else{
			return super.getPreference(userName, preferenceName);
		}
		
	}
}
