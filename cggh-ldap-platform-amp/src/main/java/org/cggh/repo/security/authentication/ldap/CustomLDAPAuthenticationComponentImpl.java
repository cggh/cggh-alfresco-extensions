package org.cggh.repo.security.authentication.ldap;

import org.alfresco.repo.security.authentication.AuthenticationDiagnostic;
import org.alfresco.repo.security.authentication.AuthenticationException;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.cggh.repo.security.sync.ldap.CustomLDAPNameResolver;
import org.cggh.repo.security.sync.ldap.LDAPResolvedUser;

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
			AuthenticationDiagnostic diagnostic = new AuthenticationDiagnostic();
			LDAPResolvedUser resolvedUser = ldapNameResolver.getResolvedUser(userName, diagnostic);
			userName = resolvedUser.getUserName();
			// It would be more efficient to just setCurrentUser instead of
			// doing a second LDAP lookup
			super.authenticateImpl(userName, password);
		} catch (AuthenticationException ae) {
			logger.error("Authentication failed for:" + userName, ae);
			throw ae;
		}
	}

}
