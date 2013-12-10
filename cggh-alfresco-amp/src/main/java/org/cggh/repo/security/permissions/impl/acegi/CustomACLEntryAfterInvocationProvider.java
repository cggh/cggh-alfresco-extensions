package org.cggh.repo.security.permissions.impl.acegi;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.StringTokenizer;

import net.sf.acegisecurity.AccessDeniedException;
import net.sf.acegisecurity.Authentication;
import net.sf.acegisecurity.ConfigAttribute;
import net.sf.acegisecurity.ConfigAttributeDefinition;
import net.sf.acegisecurity.afterinvocation.AfterInvocationProvider;
import net.sf.acegisecurity.providers.dao.User;

import org.alfresco.query.ListBackedPagingResults;
import org.alfresco.query.PagingResults;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.security.permissions.impl.acegi.ACLEntryVoterException;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.security.PersonService.PersonInfo;
import org.aopalliance.intercept.MethodInvocation;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.InitializingBean;

public class CustomACLEntryAfterInvocationProvider implements AfterInvocationProvider, InitializingBean {

    private static Log log = LogFactory.getLog(CustomACLEntryAfterInvocationProvider.class);

    private static final String AFTER_ACL_SHARED_SITE = "AFTER_ACL_SHARED_SITE";

    private static final String AFTER_ACL_SHARED_SITE_NULL = "AFTER_ACL_SHARED_SITE_NULL";

    private AuthorityService authorityService;

    private PersonService personService;

    @Override
    @SuppressWarnings("rawtypes")
    public Object decide(Authentication authentication, Object object, ConfigAttributeDefinition config,
	    Object returnedObject) throws AccessDeniedException {
	if (log.isDebugEnabled() && object instanceof MethodInvocation)
	{
	    MethodInvocation mi = (MethodInvocation) object;
	    log.debug("Method: " + mi.getMethod().toString());
	}
	try
	{
	    if (AuthenticationUtil.isRunAsUserTheSystemUser())
	    {
		if (log.isDebugEnabled())
		{
		    log.debug("Allowing system user access");
		}
		return returnedObject;
	    } else if (returnedObject == null)
	    {
		if (log.isDebugEnabled())
		{
		    log.debug("Allowing null object access");
		}
		return null;
	    } else
	    {
		/*
		 * if (Collection.class
		 * .isAssignableFrom(returnedObject.getClass())) {
		 * log.debug("Controlled object - access being checked for " +
		 * returnedObject.getClass().getName()); return
		 * decide(authentication, object, config, (Collection)
		 * returnedObject); } else
		 */
		if (PagingResults.class.isAssignableFrom(returnedObject.getClass()))
		{

		    if (log.isDebugEnabled())
		    {
			log.debug("Controlled object 1 - access being checked for "
				+ returnedObject.getClass().getName());

			log.debug("Received n = " + ((PagingResults) returnedObject).getPage().size());
		    }
		    PagingResults retObject = decide(authentication, object, config, (PagingResults) returnedObject);
		    if (log.isDebugEnabled())
		    {
			log.debug("Returned n=" + retObject.getPage().size());
		    }
		    return (retObject);

		} else if (PersonInfo.class.isAssignableFrom(returnedObject.getClass()))
		{
		    if (log.isDebugEnabled())
		    {
			log.debug("Controlled object 2 - access being checked for "
				+ returnedObject.getClass().getName());
		    }
		    return decide(authentication, object, config, (PersonInfo) returnedObject);
		} else if (NodeRef.class.isAssignableFrom(returnedObject.getClass()))
		{
		    if (log.isDebugEnabled())
		    {
			log.debug("Controlled object 3 - access being checked for "
				+ returnedObject.getClass().getName());
		    }
		    return decide(authentication, object, config, (NodeRef) returnedObject);

		} else
		{
		    if (log.isDebugEnabled())
		    {
			log.debug("Uncontrolled object - access allowed for " + returnedObject.getClass().getName());
		    }
		    return returnedObject;
		}
	    }
	} catch (AccessDeniedException ade)
	{
	    if (log.isDebugEnabled())
	    {
		log.debug("Access denied", ade);
		ade.printStackTrace();
	    }
	    throw ade;
	} catch (RuntimeException re)
	{
	    if (log.isDebugEnabled())
	    {
		log.debug("Access denied by runtime exception", re);
		re.printStackTrace();
	    }
	    throw re;
	}

    }

    private String getSiteNameFromGroup(String auth) {
	if (auth.startsWith("GROUP_site_"))
	{
	    String groupName = auth.substring("GROUP_site_".length());

	    int pos = groupName.indexOf('_');
	    if (pos > 0)
	    {
		return groupName.substring(0, pos);
	    } else
	    {
		return groupName;
	    }
	}
	return null;

    }

    private NodeRef decide(final Authentication authentication, final Object object,
	    final ConfigAttributeDefinition config, final NodeRef returnedObject) throws AccessDeniedException

    {
	// Repeating logic but ensures not calling personService.getPerson on a
	// non-person node
	List<ConfigAttributeDefintion> supportedDefinitions = extractSupportedDefinitions(config);
	if (log.isDebugEnabled())
	{
	    log.debug("Entries are " + supportedDefinitions);
	}

	if (supportedDefinitions.size() == 0)
	{
	    if (log.isDebugEnabled())
	    {
		log.debug("No supported entries");
	    }
	    return returnedObject;
	}
	/*
	 * Safe but possibly OTT QName personQName =
	 * QName.createQName("cm:person", nspr); QName nodeType =
	 * nodeService.getType(returnedObject);
	 * 
	 * if (!(personQName.isMatch(nodeType))) {
	 * log.debug("Returning non-person node"); return (returnedObject); }
	 */
	PersonInfo pi = personService.getPerson(returnedObject);

	PersonInfo ret = decide(authentication, object, config, pi);
	// Exception will be rethrown if that's what we want
	if (ret == null)
	{
	    return null;
	} else
	{
	    return returnedObject;
	}
    }

    private PersonInfo decide(Authentication authentication, Object object, ConfigAttributeDefinition config,
	    PersonInfo returnedObject) throws AccessDeniedException {

	List<ConfigAttributeDefintion> supportedDefinitions = extractSupportedDefinitions(config);
	if (log.isDebugEnabled())
	{
	    log.debug("Entries are " + supportedDefinitions);
	}

	if (supportedDefinitions.size() == 0)
	{
	    if (log.isDebugEnabled())
	    {
		log.debug("No supported entries");
	    }
	    return returnedObject;
	}

	String currentUser = ((User) authentication.getPrincipal()).getUsername();
	Set<String> userAuthorities = this.getGroups(currentUser);

	if (this.ignoreFilter(supportedDefinitions, userAuthorities)
		|| currentUser.equals(returnedObject.getUserName()))
	{
	    return returnedObject;
	}

	ArrayList<String> userSites = this.getUserSites(userAuthorities);

	String personUserName = returnedObject.getUserName();
	Set<String> personAuthorities = authorityService.getAuthoritiesForUser(personUserName);

	if (log.isDebugEnabled())
	{
	    log.debug("Authorities for:" + personUserName);
	}
	boolean found = false;
	for (String auth : personAuthorities)
	{
	    log.debug(auth);
	    String site = getSiteNameFromGroup(auth);
	    if (userSites.contains(site))
	    {
		found = true;
		if (log.isDebugEnabled())
		{
		    log.debug("Found matching site:" + site + " for " + personUserName);
		}
		break;
	    }
	}

	if (found)
	{
	    return returnedObject;
	} else
	{
	    boolean returnNull = false;
	    for (ConfigAttributeDefintion def : supportedDefinitions)
	    {
		if (def.typeString.equals(AFTER_ACL_SHARED_SITE_NULL))
		{
		    returnNull = true;
		}
	    }
	    if (returnNull)
	    {
		return null;
	    } else
	    {
		throw new AccessDeniedException("Access denied for person");
	    }
	}

    }

    @SuppressWarnings({ "rawtypes", "unchecked" })
    private PagingResults decide(final Authentication authentication, final Object object,
	    final ConfigAttributeDefinition config, final PagingResults returnedObject) throws AccessDeniedException

    {
	List<ConfigAttributeDefintion> supportedDefinitions = extractSupportedDefinitions(config);
	if (log.isDebugEnabled())
	{
	    log.debug("Entries are " + supportedDefinitions);
	}

	if (supportedDefinitions.size() == 0)
	{
	    if (log.isDebugEnabled())
	    {
		log.debug("No supported entries");
	    }
	    return returnedObject;
	}

	String currentUser = ((User) authentication.getPrincipal()).getUsername();
	Set<String> userAuthorities = this.getGroups(currentUser);

	if (this.ignoreFilter(supportedDefinitions, userAuthorities))
	{
	    return returnedObject;
	}

	ArrayList<String> userSites = this.getUserSites(userAuthorities);

	List<PersonInfo> page = returnedObject.getPage();
	List<PersonInfo> results = page;
	List<PersonInfo> newList = new ArrayList<PersonInfo>();

	for (PersonInfo person : results)
	{
	    String personUserName = person.getUserName();
	    Set<String> personAuthorities = authorityService.getAuthoritiesForUser(personUserName);

	    if (log.isDebugEnabled())
	    {
		log.debug("Authorities for:" + personUserName);
	    }
	    boolean found = false;
	    for (String auth : personAuthorities)
	    {
		if (log.isDebugEnabled())
		{
		    log.debug(auth);
		}
		String site = getSiteNameFromGroup(auth);
		if (userSites.contains(site) || currentUser.equals(personUserName))
		{
		    found = true;
		    if (log.isDebugEnabled())
		    {
			log.debug("Found matching site:" + site + " for " + personUserName);
		    }
		    break;
		}
	    }
	    if (found)
	    {
		newList.add(person);
	    }
	}
	return new ListBackedPagingResults(newList);
    }

    private Set<String> getGroups(final String userName) {

	Set<String> userAuthorities = authorityService.getAuthoritiesForUser(userName);

	return (userAuthorities);
    }

    private ArrayList<String> getUserSites(final Set<String> userAuthorities) {

	ArrayList<String> sites = new ArrayList<String>();
	for (String auth : userAuthorities)
	{
	    if (log.isDebugEnabled())
	    {
		log.debug(auth);
	    }
	    String site = getSiteNameFromGroup(auth);
	    if (site != null)
	    {
		sites.add(site);
	    }
	}
	return sites;
    }

    private boolean ignoreFilter(final List<ConfigAttributeDefintion> supportedDefinitions, Set<String> userAuthorities) {

	for (String auth : userAuthorities)
	{
	    if (auth.equals("GROUP_ALFRESCO_ADMINISTRATORS"))
	    {
		if (log.isDebugEnabled())
		{
		    log.debug("Administrator allowed");
		}
		return true;
	    }
	    for (ConfigAttributeDefintion cfg : supportedDefinitions)
	    {
		if (cfg.groupName.equals(auth))
		{
		    if (log.isDebugEnabled())
		    {
			log.debug("Allowed member of:" + cfg.groupName);
		    }
		    return true;
		}
	    }
	}
	return (false);
    }

    @SuppressWarnings("rawtypes")
    private List<ConfigAttributeDefintion> extractSupportedDefinitions(final ConfigAttributeDefinition config) {
	List<ConfigAttributeDefintion> definitions = new ArrayList<ConfigAttributeDefintion>();
	Iterator iter = config.getConfigAttributes();
	if (log.isDebugEnabled())
	{
	    log.debug("Config:" + config);
	}
	while (iter.hasNext())
	{
	    ConfigAttribute attr = (ConfigAttribute) iter.next();
	    if (log.isDebugEnabled())
	    {
		log.debug("Config attr:" + attr);
	    }
	    if (this.supports(attr))
	    {
		definitions.add(new ConfigAttributeDefintion(attr));
	    }

	}
	return definitions;
    }

    private class ConfigAttributeDefintion {

	String typeString;

	String groupName;

	ConfigAttributeDefintion(final ConfigAttribute attr) {

	    StringTokenizer st = new StringTokenizer(attr.getAttribute(), ".", false);
	    if (st.countTokens() != 2)
	    {
		throw new ACLEntryVoterException("There must be two . separated tokens in each config attribute");
	    }
	    typeString = st.nextToken();
	    groupName = st.nextToken();

	    if (!(typeString.equals(AFTER_ACL_SHARED_SITE) || typeString.equals(AFTER_ACL_SHARED_SITE_NULL)))
	    {
		throw new ACLEntryVoterException("Invalid type: must be " + AFTER_ACL_SHARED_SITE + " or "
			+ AFTER_ACL_SHARED_SITE_NULL);
	    }

	    if (!(groupName.startsWith("GROUP_")))
	    {
		throw new ACLEntryVoterException("group name must start with GROUP_ " + groupName);
	    }
	}
    }

    public void setAuthorityService(AuthorityService authorityService) {
	this.authorityService = authorityService;
    }

    public void afterPropertiesSet() throws Exception {
	if (authorityService == null)
	{
	    throw new IllegalArgumentException("There must be a authority service");
	}
    }

    public boolean supports(ConfigAttribute attribute) {
	if ((attribute.getAttribute() != null) && (attribute.getAttribute().startsWith(AFTER_ACL_SHARED_SITE)))
	{
	    return true;
	} else
	{
	    return false;
	}
    }

    @SuppressWarnings("rawtypes")
    public boolean supports(Class clazz) {
	return (MethodInvocation.class.isAssignableFrom(clazz));
    }

    public void setPersonService(PersonService personService) {
	this.personService = personService;
    }

}
