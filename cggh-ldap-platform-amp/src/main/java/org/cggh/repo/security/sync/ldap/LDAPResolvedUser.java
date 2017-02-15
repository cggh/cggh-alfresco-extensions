package org.cggh.repo.security.sync.ldap;

public class LDAPResolvedUser {

	private String dn;
	private String userName;
	public String getDn() {
		return dn;
	}
	public void setDn(String dn) {
		this.dn = dn;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	
}
