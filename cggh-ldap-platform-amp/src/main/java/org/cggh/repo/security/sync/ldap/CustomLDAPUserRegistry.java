package org.cggh.repo.security.sync.ldap;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStream;
import java.text.ParseException;
import java.util.Date;
import java.util.Map;

import javax.naming.Context;
import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.InitialDirContext;
import javax.naming.directory.SearchControls;
import javax.naming.directory.SearchResult;

import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.security.authentication.AuthenticationDiagnostic;
import org.alfresco.repo.security.authentication.AuthenticationException;
import org.alfresco.repo.security.sync.NodeDescription;
import org.alfresco.service.namespace.QName;
import org.alfresco.util.PropertyMap;
import org.alfresco.util.TempFileProvider;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class CustomLDAPUserRegistry extends LDAPUserRegistry implements CustomLDAPNameResolver {

	/** The logger. */
	private static Log logger = LogFactory.getLog(CustomLDAPUserRegistry.class);

	private String lookupAttributeName;

	public void setLookupAttributeName(String lookupAttributeName) {
		this.lookupAttributeName = lookupAttributeName;
	}

	protected NodeDescription mapToNode(Map<String, String> attributeMapping, Map<String, String> attributeDefaults,
			SearchResult result) throws NamingException {
		NodeDescription nodeDescription = new NodeDescription(result.getNameInNamespace());
		Attributes ldapAttributes = result.getAttributes();

		// Parse the timestamp
		Attribute modifyTimestamp = ldapAttributes.get(this.modifyTimestampAttributeName);
		Date ldapLastModified = null;
		if (modifyTimestamp != null) {
			try {
				ldapLastModified = this.timestampFormat.parse(modifyTimestamp.get().toString());
				nodeDescription.setLastModified(ldapLastModified);
			} catch (ParseException e) {
				throw new AlfrescoRuntimeException("Failed to parse timestamp.", e);
			}
		}

		// Apply the mapped attributes
		PropertyMap properties = nodeDescription.getProperties();
		for (String key : attributeMapping.keySet()) {
			QName keyQName = QName.createQName(key, this.namespaceService);

			// cater for null
			String attributeName = attributeMapping.get(key);
			if (attributeName != null) {
				Attribute attribute = ldapAttributes.get(attributeName);
				if (attribute != null) {
					Object value = attribute.get(0);
					if (value != null) {
						if (value instanceof String) {
							properties.put(keyQName, (String) value);
						} else {
							try {
								setNonStringProperty(properties, keyQName, attribute);
							} catch (Exception e) {
								logger.error("failed setting property for :"
										+ (String) nodeDescription.getProperties().get(ContentModel.PROP_USERNAME));
							}
						}
					}
				} else {
					String defaultValue = attributeDefaults.get(key);
					if (defaultValue != null) {
						properties.put(keyQName, defaultValue);
					}
				}
			} else {
				String defaultValue = attributeDefaults.get(key);
				if (defaultValue != null) {
					properties.put(keyQName, defaultValue);
				}
			}
		}
		return nodeDescription;
	}

	private void setNonStringProperty(PropertyMap properties, QName keyQName, Attribute attribute) throws Exception {
		if (attribute != null) {
			byte[] value = (byte[]) attribute.get(0);
			if (value != null) {
				try {
					InputStream is = new ByteArrayInputStream(value);
					File attributeValueFile;
					attributeValueFile = TempFileProvider.createTempFile(is, keyQName.getLocalName(), "");
					is.close();
					properties.put(keyQName, attributeValueFile.getAbsolutePath());
					if (logger.isDebugEnabled()) {
						String msg = keyQName.toPrefixString();
						if (properties.get(ContentModel.PROP_USERNAME) != null) {
							msg += " for " + properties.get(ContentModel.PROP_USERNAME);
						}
						logger.debug("Set non string property:" + msg);
					}
				} catch (Exception e) {
					// Warn here, error in parent
					logger.warn("Unable to save attribute value to file:" + keyQName.getLocalName(), e);
					throw e;
				}
			}
		}
	}
	
	/**
	 * 
	 * This is very similar to:
	 * @see org.alfresco.repo.security.sync.ldap.LDAPNameResolver#resolveDistinguishedName(java.lang.String)
	 */
	public LDAPResolvedUser getResolvedUser(String userId, AuthenticationDiagnostic diagnostic) throws AuthenticationException
	{
		LDAPResolvedUser resolvedUser = new LDAPResolvedUser();
		resolvedUser.setUserName(userId);
		
        if(logger.isDebugEnabled())
        {
            logger.debug("resolveDistinguishedName userId:" + userId);
        }
        SearchControls userSearchCtls = new SearchControls();
        userSearchCtls.setSearchScope(SearchControls.SUBTREE_SCOPE);

        String searchField = this.userIdAttributeName;
        
        if (this.lookupAttributeName != null && this.lookupAttributeName.length() > 0) {
        	searchField = this.lookupAttributeName;
        }
        
        // Although we don't actually need any attributes, we ask for the UID for compatibility with Sun Directory Server. See ALF-3868
        userSearchCtls.setReturningAttributes(new String[]
        {
            this.userIdAttributeName,
            searchField
        });
        

        
        String query = this.userSearchBase + "(&" + this.personQuery
        + "(" + searchField + "= userId))";


        NamingEnumeration<SearchResult> searchResults = null;
        SearchResult result = null;

        InitialDirContext ctx = null;
        try
        {
            ctx = this.ldapInitialContextFactory.getDefaultIntialDirContext(diagnostic);

            // Execute the user query with an additional condition that ensures only the user with the required ID is
            // returned. Force RFC 2254 escaping of the user ID in the filter to avoid any manipulation            
            
             searchResults = ctx.search(this.userSearchBase, "(&" + this.personQuery
                    + "(" + searchField + "={0}))", new Object[]
            {
                userId
            }, userSearchCtls);

            if (searchResults.hasMore())
            {
                result = searchResults.next();
                Attributes attributes = result.getAttributes();
                Attribute searchAttribute = attributes.get(searchField);
                Attribute uidAttribute = attributes.get(this.userIdAttributeName);
                if (uidAttribute == null)
                {
                    if (this.errorOnMissingUID)
                    {
                        throw new AlfrescoRuntimeException(
                                "User returned by user search does not have mandatory user id attribute "
                                        + attributes);
                    }
                    else
                    {
                        CustomLDAPUserRegistry.logger
                                .warn("User returned by user search does not have mandatory user id attribute "
                                        + attributes);
                    }
                }
                // MNT:2597 We don't trust the LDAP server's treatment of whitespace, accented characters etc. We will
                // only resolve this user if the user ID matches
                else if (userId.equalsIgnoreCase((String) searchAttribute.get(0)))
                {
                    String name = result.getNameInNamespace();

                    // Close the contexts, see ALF-20682
                    Context context = (Context) result.getObject();
                    if (context != null)
                    {
                        context.close();
                    }
                    result = null;
                    resolvedUser.setUserName((String) uidAttribute.get(0));
                    resolvedUser.setDn(name);
                    return resolvedUser;
                }

                // Close the contexts, see ALF-20682
                Context context = (Context) result.getObject();
                if (context != null)
                {
                    context.close();
                }
                result = null;
            }
            
            Object[] args = {userId, query};
            diagnostic.addStep(AuthenticationDiagnostic.STEP_KEY_LDAP_LOOKUP_USER, false, args);
            
            throw new AuthenticationException("authentication.err.connection.ldap.user.notfound", args, diagnostic);
        }
        catch (NamingException e)
        {
            // Connection is good here - AuthenticationException would be thrown by ldapInitialContextFactory
            
            Object[] args1 = {userId, query};
            diagnostic.addStep(AuthenticationDiagnostic.STEP_KEY_LDAP_SEARCH, false, args1);
            
            // failed to search
            Object[] args = {e.getLocalizedMessage()};
            throw new AuthenticationException("authentication.err.connection.ldap.search", diagnostic, args, e);
        }
        finally
        {
            if (result != null)
            {
                try
                {
                    Context context = (Context) result.getObject();
                    if (context != null)
                    {
                        context.close();
                    }
                }
                catch (Exception e)
                {
                    logger.debug("error when closing result block context", e);
                }
            }
            if (searchResults != null)
            {
                try
                {
                    searchResults.close();
                }
                catch (Exception e)
                {
                    logger.debug("error when closing searchResults context", e);
                }
            }
            if (ctx != null)
            {
                try
                {
                    ctx.close();
                }
                catch (NamingException e)
                {
                    logger.debug("error when closing ldap context", e);
                }
            }
        }
    }
}
