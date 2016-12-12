package org.cggh.repo.security.sync.ldap;

import org.alfresco.repo.security.sync.ldap.LDAPNameResolver;

public interface CustomLDAPNameResolver extends LDAPNameResolver {

	public String getAlfUserId();
}
