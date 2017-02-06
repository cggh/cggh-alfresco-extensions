package org.cggh.repo.security.authentication.ldap;

import org.alfresco.repo.security.authentication.AuthenticationException;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.cggh.repo.security.sync.ldap.CustomLDAPNameResolver;

public class CustomLDAPAuthenticationComponentImpl
		extends org.alfresco.repo.security.authentication.ldap.LDAPAuthenticationComponentImpl {

	private static Log logger = LogFactory.getLog(CustomLDAPAuthenticationComponentImpl.class);

	private CustomLDAPNameResolver ldapNameResolver;

	public void setLdapNameResolver(CustomLDAPNameResolver ldapNameResolver) {
		this.ldapNameResolver = ldapNameResolver;
		super.setLdapNameResolver(ldapNameResolver);
	}

    
	@Override
	protected void authenticateImpl(String userName, char[] password) throws AuthenticationException {

		try {
			super.authenticateImpl(userName, password);
			//Exception will be thrown if authentication failed
			setCurrentUser(ldapNameResolver.getAlfUserId());
		} catch (AuthenticationException ae) {
			logger.error("Authentication failed for:" + userName, ae);
			throw ae;
		}
	}

}
