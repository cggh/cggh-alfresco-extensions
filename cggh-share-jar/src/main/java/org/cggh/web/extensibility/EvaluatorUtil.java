package org.cggh.web.extensibility;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpSession;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.simple.parser.ParseException;
import org.springframework.extensions.surf.RequestContext;
import org.springframework.extensions.surf.ServletUtil;
import org.springframework.extensions.surf.UserFactory;
import org.springframework.extensions.surf.exception.ConnectorServiceException;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.connector.Connector;
import org.springframework.extensions.webscripts.connector.CredentialVault;
import org.springframework.extensions.webscripts.connector.Credentials;
import org.springframework.extensions.webscripts.connector.Response;

public class EvaluatorUtil
{

	private static Log log = LogFactory.getLog(EvaluatorUtil.class);

	/**
	 * Determines whether or not the current user is a member of the supplied
	 * group.
	 * 
	 * This version is different from the supplied version because it checks
	 * site groups when the user is not in the site
	 * 
	 * @see org.alfresco.web.extensibility.SlingshotEvaluatorUtil
	 * 
	 * @param context
	 * @param groupName
	 * @return
	 */
	public boolean isMemberOfSites(RequestContext context, List<String> groups, boolean memberOfAllGroups)
	{
		// Initialise the default result to be null... we're intentionally using
		// a Boolean object over boolean
		// primitive to give us access to the third value of null. This allows
		// us to determine whether or not
		// any membership information has actually been processed (e.g. when NO
		// groups have been specified).
		Boolean isMember = null;

		HttpSession session = ServletUtil.getSession();
		String userName = (String) session.getAttribute(UserFactory.SESSION_ATTRIBUTE_KEY_USER_ID);
		org.json.simple.JSONArray sitesList = null;
		sitesList = getUserSites(context, userName);

		if (log.isDebugEnabled())
		{
			log.debug("Check site membership");
		}
		// Work through the supplied list of groups to determine whether or not
		// the current user is a member of them...
		for (String groupName : groups)
		{
			boolean isMemberOfCurrentGroup = false;

			if (log.isDebugEnabled())
			{
				log.debug("Group:" + groupName);
			}

			if (groupName != null)
			{
				// If the requested groupName begins with "site" then this
				// indicates that we are looking
				// for a site specific group such as "SiteConsumer"
				if (groupName.startsWith("site"))
				{

					try
					{

						// Look at all the sites we're a member of
						if (sitesList != null)
						{
							@SuppressWarnings("unchecked")
							Iterator<org.json.simple.JSONObject> i = sitesList.iterator();
							while (i.hasNext())
							{
								org.json.simple.JSONObject group = (org.json.simple.JSONObject) i.next();
								String currentSite = group.get("shortName").toString();

								if (log.isDebugEnabled())
								{
									log.debug("Checking site:" + currentSite);
								}
								Connector connector = context.getServiceRegistry().getConnectorService()
										.getConnector("alfresco", userName, ServletUtil.getSession());
								Response res = connector.call("/api/sites/" + currentSite + "/memberships/"
										+ URLEncoder.encode(context.getUserId(),"UTF-8"));
								if (res.getStatus().getCode() == Status.STATUS_OK)
								{
									String response = res.getResponse();
									org.json.simple.parser.JSONParser p = new org.json.simple.parser.JSONParser();
									Object o2 = p.parse(response);
									if (o2 instanceof org.json.simple.JSONObject)
									{
										org.json.simple.JSONObject jsonRes = (org.json.simple.JSONObject) o2;
										String siteMembership = "site_" + currentSite + "_"
												+ (String) jsonRes.get("role");
										if (log.isDebugEnabled())
										{
											log.debug("Check:" + siteMembership + " vs " + groupName);
										}
										isMemberOfCurrentGroup = siteMembership.equals(groupName);
										if (isMemberOfCurrentGroup)
										{
											break;
										}

									}
								} else
								{
									// When the user is NOT a member of the site
									// the request will actually return a 404
									// (rather than a 200)
									// so on any request that fails we will
									// assume they are not a member of the site.
									isMemberOfCurrentGroup = false;
								}
							}
						}

					} catch (ConnectorServiceException e)
					{
						e.printStackTrace();
					} catch (ParseException e)
					{
						e.printStackTrace();
					} catch (UnsupportedEncodingException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
			}

			if (log.isDebugEnabled())
			{
				log.debug("Current group member:" + isMemberOfCurrentGroup);
			}
			// Handle the requested membership logic and make a quick exit if
			// possible...
			if (memberOfAllGroups)
			{
				isMember = (isMember == null) ? isMemberOfCurrentGroup : isMember && isMemberOfCurrentGroup;
				if (!isMember)
				{
					// Break out of the main loop if the user must be a member
					// of all groups and is not
					// a member of at least one of them. There is no point in
					// checking the remaining groups
					break;
				}
			} else
			{
				isMember = (isMember == null) ? isMemberOfCurrentGroup : isMember || isMemberOfCurrentGroup;
				if (isMember)
				{
					// Break out of the main loop if the user is a member of at
					// least one group as that
					// is all that is required.
					break;
				}
			}
		}
		return isMember;
	}

	private org.json.simple.JSONArray getUserSites(RequestContext context, String userName)
	{
		org.json.simple.JSONArray sitesList = null;

		try
		{
			// Get the Site membership information...

			Connector connector = context.getServiceRegistry().getConnectorService()
					.getConnector("alfresco", userName, ServletUtil.getSession());
			Response res = connector.call("/api/people/" + URLEncoder.encode(context.getUserId(),"UTF-8") + "/sites");
			if (res.getStatus().getCode() == Status.STATUS_OK)
			{
				String response = res.getResponse();
				org.json.simple.parser.JSONParser p = new org.json.simple.parser.JSONParser();
				Object o2 = p.parse(response);
				if (o2 instanceof org.json.simple.JSONArray)
				{
					sitesList = (org.json.simple.JSONArray) o2;

				}
			}

		} catch (ConnectorServiceException e)
		{
			e.printStackTrace();
		} catch (ParseException e)
		{
			e.printStackTrace();
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return sitesList;
	}

	/**
	 * From here down should really come from SlingshotEvaluatorUtil but I
	 * haven't worked out the right maven incantation yet
	 * 
	 */
	protected static final String SITE = "site";

	/**
	 * Returns the current site id OR null if we aren't in a site
	 * 
	 * @param context
	 * @return The current site id OR null if we aren't in a site
	 */
	public String getSite(RequestContext context)
	{
		// Look for siteId in url path & parameters
		String site = context.getUriTokens().get(SITE);
		if (site == null)
		{
			site = context.getParameter(SITE);
		}
		if (site == null)
		{
			String[] pathNames = context.getUri().substring(context.getContextPath().length()).split("/");
			for (int i = 0; i < pathNames.length; i++)
			{
				if (pathNames[i].equals(SITE) && (i + 1 < pathNames.length))
				{
					site = pathNames[i + 1];
					break;
				}
			}
		}
		return site;
	}

	/**
	 * Determines whether or not the current user is a member of the supplied
	 * group.
	 * 
	 * @param context
	 * @param groupName
	 * @return
	 */
	@SuppressWarnings({ "rawtypes" })
	public boolean isMemberOfGroups(RequestContext context, List<String> groups, boolean memberOfAllGroups)
	{
		// Initialise the default result to be null... we're intentionally using
		// a Boolean object over boolean
		// primitive to give us access to the third value of null. This allows
		// us to determine whether or not
		// any membership information has actually been processed (e.g. when NO
		// groups have been specified).
		Boolean isMember = null;

		// We're going to store GROUP membership in the HttpSession as this
		// changes infrequently but will be
		// accessing SITE membership for every request. Surf will ensure that
		// requests are cached for each
		// page so we are not making the same request more than once per page.
		// Site membership can change more
		// frequently so we need to be sure that the information we have is
		// up-to-date.
		HttpSession session = ServletUtil.getSession();
		org.json.simple.JSONArray groupsList = null;
		String GROUP_MEMBERSHIPS = "AlfGroupMembershipsKey";

		// Get the current site
		String currentSite = getSite(context);

		// Get all the group membership first so that we don't perform this
		// operation multiple times... check
		// the HttpSession and if it's not already available then make a request
		// for it and cache it for future
		// reference. Note that we're ONLY caching the current users membership
		// information.
		Object _cachedGroupMemberships = session.getAttribute(GROUP_MEMBERSHIPS);
		if (_cachedGroupMemberships instanceof org.json.simple.JSONArray)
		{
			groupsList = (org.json.simple.JSONArray) _cachedGroupMemberships;
		} else
		{
			try
			{

				String userName = (String) session.getAttribute(UserFactory.SESSION_ATTRIBUTE_KEY_USER_ID);
				if (userName == null)
				{
					return false;
				}
				Connector connector = context.getServiceRegistry().getConnectorService()
						.getConnector("alfresco", userName, ServletUtil.getSession());
				Response res = connector.call("/api/people/" + URLEncoder.encode(context.getUserId(),"UTF-8") + "?groups=true");
				if (res.getStatus().getCode() == Status.STATUS_OK)
				{
					String response = res.getResponse();
					org.json.simple.parser.JSONParser p = new org.json.simple.parser.JSONParser();
					Object o2 = p.parse(response);
					if (o2 instanceof org.json.simple.JSONObject)
					{
						org.json.simple.JSONObject jsonRes = (org.json.simple.JSONObject) o2;
						groupsList = (org.json.simple.JSONArray) jsonRes.get("groups");
						session.setAttribute(GROUP_MEMBERSHIPS, groupsList);
					}
				}

			} catch (ConnectorServiceException e)
			{
				e.printStackTrace();
			} catch (ParseException e)
			{
				e.printStackTrace();
			} catch (UnsupportedEncodingException e) {
				try {
					log.error("Error fetching group membership for " + URLEncoder.encode(context.getUserId(),"UTF-8"), e);
				} catch (UnsupportedEncodingException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}
			}
		}

		log.debug("Checking membership for:" + (String) session.getAttribute(UserFactory.SESSION_ATTRIBUTE_KEY_USER_ID));
		// Work through the supplied list of groups to determine whether or not
		// the current user is a member of them...
		for (String groupName : groups)
		{
			boolean isMemberOfCurrentGroup = false;
			if (groupName != null)
			{
				// If the requested groupName begins with "Site" then this
				// indicates that we are looking
				// for a site specific group such as "SiteConsumer" and we
				// therefore need to modify the
				// group name to reflect the current site. If we are not
				// currently viewing a site then
				// we will automatically indicate that the user is not a member
				// (how can they be a member
				// of the current site if they're not in a site?) and move onto
				// the next group...
				if (groupName.startsWith("Site"))
				{
					if (currentSite == null)
					{
						isMember = false;
					} else
					{
						// We're going to rely on URI tokens to determine if
						// we're viewing a site - it's the
						// best data available from the RequestContext.
						try
						{
							String userName = (String) session.getAttribute(UserFactory.SESSION_ATTRIBUTE_KEY_USER_ID);
							if (userName == null)
							{
								return false;
							}
							Connector connector = context.getServiceRegistry().getConnectorService()
									.getConnector("alfresco", userName, ServletUtil.getSession());
							Response res = connector.call("/api/sites/" + currentSite + "/memberships/"
									+ URLEncoder.encode(context.getUserId(),"UTF-8"));
							if (res.getStatus().getCode() == Status.STATUS_OK)
							{
								String response = res.getResponse();
								org.json.simple.parser.JSONParser p = new org.json.simple.parser.JSONParser();
								Object o2 = p.parse(response);
								if (o2 instanceof org.json.simple.JSONObject)
								{
									org.json.simple.JSONObject jsonRes = (org.json.simple.JSONObject) o2;
									String siteMembership = (String) jsonRes.get("role");
									isMemberOfCurrentGroup = siteMembership.equals(groupName);
								}
							} else
							{
								// When the user is NOT a member of the site
								// the request will actually return a 404
								// (rather than a 200)
								// so on any request that fails we will
								// assume they are not a member of the site.
								isMemberOfCurrentGroup = false;
							}

						} catch (ConnectorServiceException e)
						{
							e.printStackTrace();
						} catch (ParseException e)
						{
							e.printStackTrace();
						} catch (UnsupportedEncodingException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
					}
				} else if (groupsList != null)
				{
					// Check for regular GROUP membership... all non-site groups
					// MUST begin "GROUP"...
					Iterator i = groupsList.iterator();
					while (i.hasNext())
					{
						org.json.simple.JSONObject group = (org.json.simple.JSONObject) i.next();
						String currGroupName = group.get("itemName").toString();
						log.debug("Check " + currGroupName + " vs " + groupName);
						if (currGroupName.equals(groupName))
						{
							isMemberOfCurrentGroup = true;
							break;
						}
					}
				}
			}

			// Handle the requested membership logic and make a quick exit if
			// possible...
			if (memberOfAllGroups)
			{
				isMember = (isMember == null) ? isMemberOfCurrentGroup : isMember && isMemberOfCurrentGroup;
				if (!isMember)
				{
					// Break out of the main loop if the user must be a member
					// of all groups and is not
					// a member of at least one of them. There is no point in
					// checking the remaining groups
					break;
				}
			} else
			{
				isMember = (isMember == null) ? isMemberOfCurrentGroup : isMember || isMemberOfCurrentGroup;
				if (isMember)
				{
					// Break out of the main loop if the user is a member of at
					// least one group as that
					// is all that is required.
					break;
				}
			}
		}
		log.debug("Return isMember:" + isMember);
		return isMember;
	}

	/**
	 * Gets the list of groups to check for membership of. This assumes that the
	 * groups have been provided as a comma delimited string and will convert
	 * that string into a List removing trailing whitespace along the way.
	 * 
	 * @param context
	 * @param evaluationProperties
	 * @return
	 */
	public List<String> getGroups(String groupsParm)
	{
		List<String> groups = new ArrayList<String>();
		if (groupsParm != null)
		{
			String[] groupsArr = groupsParm.split(",");
			for (String group : groupsArr)
			{
				groups.add(group.trim());
			}
		}
		return groups;
	}

}
