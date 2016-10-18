package org.cggh.action;

import java.io.Serializable;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.BasicAttribute;
import javax.naming.directory.DirContext;
import javax.naming.directory.ModificationItem;
import javax.naming.directory.SearchControls;
import javax.naming.directory.SearchResult;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.action.ParameterDefinitionImpl;
import org.alfresco.repo.action.executer.ActionExecuterAbstractBase;
import org.alfresco.repo.action.executer.TestModeable;
import org.alfresco.repo.security.authentication.ldap.LDAPInitialDirContextFactory;
import org.alfresco.service.cmr.action.Action;
import org.alfresco.service.cmr.action.ParameterDefinition;
import org.alfresco.service.cmr.dictionary.DataTypeDefinition;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.security.PersonService.PersonInfo;
import org.alfresco.service.namespace.NamespacePrefixResolver;
import org.alfresco.service.namespace.QName;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.InitializingBean;

public class ManageLDAPUserActionExecuter extends ActionExecuterAbstractBase implements InitializingBean, TestModeable {

	private static Log log = LogFactory.getLog(ManageLDAPUserActionExecuter.class);

	private static final String PARAM_ALL_SITE_USERS_GROUP = "usersGroup";
	private static final String DEFAULT_ALL_SITE_USERS_GROUP = "GROUP_ALL_SITE_USERS";
	private static final String PARAM_DN = "dn";
	private static final String DEFAULT_DN = "cn=siteUsers,ou=alfresco,ou=groups,dc=malariagen,dc=net";
	private static final String PARAM_MEMBER = "member";
	private static final String DEFAULT_MEMBER = "member";
	private static final String PARAM_USER_ID_ATTR = "userId";
	private static final String DEFAULT_USER_ID_ATTR = "uid";
	private static final String PARAM_SEARCH_BASE = "searchBase";
	private static final String DEFAULT_SEARCH_BASE = "ou=users,ou=people,dc=malariagen,dc=net";

	private String usersGroup;
	private String dn;
	private String member;
	private String userId;
	private String searchBase;

	private LDAPInitialDirContextFactory ldapInitialContextFactory;
	private NamespacePrefixResolver nspr;
	private NodeService nodeService;
	private AuthorityService authorityService;
	private PersonService personService;

	private boolean testMode = false;
	
	public boolean isTestMode() {
		return testMode;
	}

	public void setTestMode(boolean arg0) {
		testMode = arg0;
	}

	public void afterPropertiesSet() throws Exception {

		if (usersGroup == null || usersGroup.length() == 0)
		{
			usersGroup = DEFAULT_ALL_SITE_USERS_GROUP;
		}

		if (dn == null || dn.length() == 0)
		{
			dn = DEFAULT_DN;
		}
		if (member == null || member.length() == 0)
		{
			member = DEFAULT_MEMBER;
		}
		if (userId == null || userId.length() == 0)
		{
			userId = DEFAULT_USER_ID_ATTR;
		}
		if (searchBase == null || searchBase.length() == 0)
		{
			searchBase = DEFAULT_SEARCH_BASE;
		}
	}

	@Override
	protected void executeImpl(Action ruleAction, NodeRef actionedOn) {

		QName personQName = QName.createQName("cm:person", nspr);
		QName nodeType = nodeService.getType(actionedOn);

		if (!personQName.isMatch(nodeType))
		{
			log.debug("Node must be a person:" + nodeType);
			return;
		}

		PersonInfo person = personService.getPerson(actionedOn);

		boolean isDisabled = nodeService.hasAspect(actionedOn, ContentModel.ASPECT_PERSON_DISABLED);

		boolean shouldBeDisabled = true;
		boolean inSiteUsers = false;
		String personUserName = person.getUserName();
		Set<String> personAuthorities = authorityService.getAuthoritiesForUser(personUserName);

		log.debug("Authorities for:" + personUserName);

		for (String auth : personAuthorities)
		{
			log.debug(auth);
			if (auth.startsWith("GROUP_site_"))
			{
				shouldBeDisabled = false;
			}
			if (auth.equals("GROUP_ALFRESCO_ADMINISTRATORS"))
			{
				shouldBeDisabled = false;
			}
			if (auth.equals(usersGroup))
			{
				inSiteUsers = true;
			}
		}

		String userName = null;
		try
		{

			userName = getUserDn(person.getUserName(), ruleAction);

			BasicAttribute memberAttr = new BasicAttribute(member, userName);

			if (shouldBeDisabled)
			{
				if (!isDisabled)
				{
					Map<QName, Serializable> aspectValues = new HashMap<QName, Serializable>();
					nodeService.addAspect(actionedOn, ContentModel.ASPECT_PERSON_DISABLED, aspectValues);

					if (log.isInfoEnabled())
					{
						log.info("Enabled:" + person.getUserName());
					}

				}
				if (inSiteUsers && userName != null)
				{
					log.debug("Removing from group");
					// remove from group
					DirContext ctx = ldapInitialContextFactory.getDefaultIntialDirContext();

					// Create a LDAP add attribute for the member attribute
					ModificationItem mods[] = new ModificationItem[1];

					mods[0] = new ModificationItem(DirContext.REMOVE_ATTRIBUTE, memberAttr);

					// update the group
					ctx.modifyAttributes(dn, mods);

					ctx.close();
					if (log.isInfoEnabled())
					{
						log.info("Removed from ldap group:" + usersGroup + ":" + dn);
					}
				}
			} else
			{
				if (isDisabled)
				{
					log.debug("Removing disabled aspect");
					nodeService.removeAspect(actionedOn, ContentModel.ASPECT_PERSON_DISABLED);
					if (log.isInfoEnabled())
					{
						log.info("Disabled:" + person.getUserName());
					}
				}
				if (!inSiteUsers && userName != null)
				{
					log.debug("Adding to group");
					// add to group
					DirContext ctx = ldapInitialContextFactory.getDefaultIntialDirContext();

					// Create a LDAP add attribute for the member attribute
					ModificationItem mods[] = new ModificationItem[1];

					mods[0] = new ModificationItem(DirContext.ADD_ATTRIBUTE, memberAttr);

					// update the group
					ctx.modifyAttributes(dn, mods);

					ctx.close();
					if (log.isInfoEnabled())
					{
						log.info("Added to ldap group:" + usersGroup + ":" + dn);
					}
				}
			}

		} catch (NamingException e)
		{
			log.error("Failed to modify ldap for " + userName, e);
		}

	}

	private String getUserDn(String userName, Action ruleAction) throws NamingException {
		String idAttr = userId;

		DirContext ctx = ldapInitialContextFactory.getDefaultIntialDirContext();

		// Create the search controls
		SearchControls searchCtls = new SearchControls();

		// Specify the search scope
		searchCtls.setSearchScope(SearchControls.SUBTREE_SCOPE);

		// specify the LDAP search filter
		String searchFilter = "(" + idAttr + "=" + userName + ")";

		if (log.isDebugEnabled())
		{
			log.debug("search filter:" + searchFilter);
		}
		// Search for objects using the filter
		NamingEnumeration<SearchResult> answer = ctx.search(searchBase, searchFilter, searchCtls);

		String userDn = null;
		// Loop through the search results
		while (answer.hasMoreElements())
		{
			SearchResult sr = (SearchResult) answer.next();

			if (log.isDebugEnabled())
			{
				log.debug(">>>" + sr.getName());
				log.debug(">>>" + sr.getNameInNamespace());
			}
			userDn = sr.getNameInNamespace();
			Attributes attrs = sr.getAttributes();
			if (attrs != null)
			{

				if (log.isDebugEnabled())
				{
					try
					{
						int totalResults = 0;
						for (NamingEnumeration<? extends Attribute> ae = attrs.getAll(); ae.hasMore();)
						{
							Attribute attr = (Attribute) ae.next();
							log.debug("Attribute: " + attr.getID());
							if (log.isDebugEnabled()) 
							{
								for (NamingEnumeration<?> e = attr.getAll(); e.hasMore(); totalResults++)
								{

									log.debug(" " + totalResults + ". " + e.next());
								}
							}
						}

					} catch (NamingException e)
					{
						log.error("Problem listing members: ", e);
					}
				}
			}
		}

		ctx.close();
		if (log.isDebugEnabled())
		{
			log.debug("userDn:" + userDn);
		}
		if (userDn == null && log.isInfoEnabled()) {
			log.info("User not found in LDAP:" + searchFilter);
		}
		return userDn;
	}

	@Override
	protected void addParameterDefinitions(List<ParameterDefinition> paramList) {
		// Add definitions for action parameters

		paramList.add(new ParameterDefinitionImpl( // Create a new parameter
				// defintion to add to the
				// list
				PARAM_USER_ID_ATTR, // The name used to identify the parameter
				DataTypeDefinition.TEXT, // The parameter value type
				false, // Indicates whether the parameter is mandatory
				getParamDisplayLabel(PARAM_USER_ID_ATTR))); // The parameters
		// display label
		paramList.add(new ParameterDefinitionImpl( // Create a new parameter
				// defintion to add to the
				// list
				PARAM_ALL_SITE_USERS_GROUP, // The name used to identify the
				// parameter
				DataTypeDefinition.TEXT, // The parameter value type
				false, // Indicates whether the parameter is mandatory
				getParamDisplayLabel(PARAM_ALL_SITE_USERS_GROUP))); // The
		// parameters
		// display label
		paramList.add(new ParameterDefinitionImpl( // Create a new parameter
				// defintion to add to the
				// list
				PARAM_DN, // The name used to identify the
				// parameter
				DataTypeDefinition.TEXT, // The parameter value type
				false, // Indicates whether the parameter is mandatory
				getParamDisplayLabel(PARAM_DN))); // The parameters
		// display label

		paramList.add(new ParameterDefinitionImpl( // Create a new parameter
				// defintion to add to the
				// list
				PARAM_MEMBER, // The name used to identify the
				// parameter
				DataTypeDefinition.TEXT, // The parameter value type
				false, // Indicates whether the parameter is mandatory
				getParamDisplayLabel(PARAM_MEMBER))); // The parameters
		// display label

		paramList.add(new ParameterDefinitionImpl( // Create a new parameter
				// defintion to add to the
				// list
				PARAM_SEARCH_BASE, // The name used to identify the
				// parameter
				DataTypeDefinition.TEXT, // The parameter value type
				false, // Indicates whether the parameter is mandatory
				getParamDisplayLabel(PARAM_SEARCH_BASE))); // The parameters
		// display label
	}

	/**
	 * Sets the LDAP initial dir context factory.
	 * 
	 * @param ldapInitialDirContextFactory
	 *            the new LDAP initial dir context factory
	 */
	public void setLDAPInitialDirContextFactory(LDAPInitialDirContextFactory ldapInitialDirContextFactory) {
		this.ldapInitialContextFactory = ldapInitialDirContextFactory;
	}

	public void setUsersGroup(String usersGroup) {
		this.usersGroup = usersGroup;
	}

	public void setDn(String dn) {
		this.dn = dn;
	}

	public void setMember(String member) {
		this.member = member;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public void setSearchBase(String searchBase) {
		this.searchBase = searchBase;
	}

	public void setLdapInitialContextFactory(LDAPInitialDirContextFactory ldapInitialContextFactory) {
		this.ldapInitialContextFactory = ldapInitialContextFactory;
	}

	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}

	public void setAuthorityService(AuthorityService authorityService) {
		this.authorityService = authorityService;
	}

	public void setPersonService(PersonService personService) {
		this.personService = personService;
	}

	/**
	 * Set the namespace prefix resolver
	 * 
	 * @param nspr the namespace prefix resolver
	 */
	public void setNamespacePrefixResolver(NamespacePrefixResolver nspr) {
		this.nspr = nspr;
	}

}
