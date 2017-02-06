package org.cggh.action;

import org.alfresco.repo.action.executer.ActionExecuterAbstractBase;
import org.alfresco.repo.management.subsystems.ChildApplicationContextManager;
import org.alfresco.repo.security.authentication.ldap.LDAPInitialDirContextFactory;
import org.alfresco.repo.security.sync.UserRegistrySynchronizer;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.context.ApplicationContext;

public abstract class BaseLDAPAction extends ActionExecuterAbstractBase implements InitializingBean {

	private static Log logger = LogFactory.getLog(BaseLDAPAction.class);

	private ChildApplicationContextManager authenticationContextManager;
	private LDAPInitialDirContextFactory ldapInitialDirContextFactory;
	private UserRegistrySynchronizer userRegistrySynchronizer;
	
	public void setAuthenticationContextManager(ChildApplicationContextManager authenticationContextManager) {
		this.authenticationContextManager = authenticationContextManager;
	}

	public LDAPInitialDirContextFactory getLdapInitialDirContextFactory() {
		return ldapInitialDirContextFactory;
	}
	
	@Override
	public void afterPropertiesSet() throws Exception {
		for (String contextName : authenticationContextManager.getInstanceIds()) {
			ApplicationContext ctx = authenticationContextManager.getApplicationContext(contextName);
			try {
				ldapInitialDirContextFactory = (LDAPInitialDirContextFactory) ctx
						.getBean(LDAPInitialDirContextFactory.class);
			} catch (NoSuchBeanDefinitionException e) {
			}
			try {
				userRegistrySynchronizer = (UserRegistrySynchronizer) ctx
						.getBean(UserRegistrySynchronizer.class);
			} catch (NoSuchBeanDefinitionException e) {
			}
		}
		if (ldapInitialDirContextFactory == null) {
			logger.error("No LDAP Context Factory set");
		}
		if (userRegistrySynchronizer == null) {
			logger.error("No LDAP userRegistrySynchronizer set");
		}

	}

	public UserRegistrySynchronizer getUserRegistrySynchronizer() {
		return userRegistrySynchronizer;
	}


}
