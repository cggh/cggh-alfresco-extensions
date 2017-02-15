package org.cggh.repo.security.sync.ldap;

import org.alfresco.repo.security.authentication.AuthenticationDiagnostic;
import org.alfresco.repo.security.authentication.AuthenticationException;
import org.alfresco.repo.security.sync.ldap.LDAPNameResolver;

public interface CustomLDAPNameResolver extends LDAPNameResolver {

	public LDAPResolvedUser getResolvedUser(String userId, AuthenticationDiagnostic diagnostic) throws AuthenticationException;

}
