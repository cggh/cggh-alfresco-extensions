package org.cggh.action;

import java.util.List;

import javax.naming.Context;
import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.BasicAttribute;
import javax.naming.directory.BasicAttributes;
import javax.naming.directory.DirContext;

import org.alfresco.repo.action.ParameterDefinitionImpl;
import org.alfresco.repo.action.executer.ActionExecuterAbstractBase;
import org.alfresco.repo.action.executer.TestModeable;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.security.authentication.AuthenticationUtil.RunAsWork;
import org.alfresco.repo.security.authentication.ldap.LDAPInitialDirContextFactory;
import org.alfresco.repo.security.sync.UserRegistrySynchronizer;
import org.alfresco.service.cmr.action.Action;
import org.alfresco.service.cmr.action.ParameterDefinition;
import org.alfresco.service.cmr.dictionary.DataTypeDefinition;
import org.alfresco.service.cmr.repository.NodeRef;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.InitializingBean;

public class CreateLDAPGroupActionExecuter extends ActionExecuterAbstractBase
		implements InitializingBean, TestModeable {

	private static final String PARAM_GROUP_NAME = "group";

	private static final String DEFAULT_NAMESPACE = "http://alfresco.cggh.org/model/custom/1.0";
	private static final String PARAM_PARENT_CONTEXT = "parent";
	private static final String PARAM_OU = "ou";
	private static final String PARAM_MEMBER = "member";

	private static final String PARAM_DESCRIPTION = "description";

	private static Log logger = LogFactory
			.getLog(CreateLDAPGroupActionExecuter.class);

	private String namespace;
	private LDAPInitialDirContextFactory ldapInitialContextFactory;

	private UserRegistrySynchronizer userRegistrySynchronizer;

	private boolean testMode = false;
	
	public void setUserRegistrySynchronizer(
			UserRegistrySynchronizer userRegistrySynchronizer) {
		this.userRegistrySynchronizer = userRegistrySynchronizer;
	}

	public void setNamespace(String namespace) {
		this.namespace = namespace;
	}

	public boolean isTestMode() {
		return testMode;
	}

	public void setTestMode(boolean arg0) {
		testMode = arg0;
	}

	public void afterPropertiesSet() throws Exception {

		if (namespace == null || namespace.length() == 0) {
			namespace = DEFAULT_NAMESPACE;
		}
	}

	@Override
	protected void executeImpl(Action ruleAction, NodeRef actionedOn) {
		// We get a whole new context to avoid interference with cookies from
		// paged results

		String groupName = (String) ruleAction
				.getParameterValue(PARAM_GROUP_NAME);
		String parentContext = (String) ruleAction
				.getParameterValue(PARAM_PARENT_CONTEXT);

		Boolean ou = Boolean.parseBoolean((String) ruleAction
				.getParameterValue(PARAM_OU));
		try {

			DirContext ctx = ldapInitialContextFactory
					.getDefaultIntialDirContext();
			Context result = null;
			if (!ou) {
				Attributes attrs = new BasicAttributes(true);
				Attribute cname = new BasicAttribute("objectclass");

				cname.add("top");
				cname.add("groupofnames");
				attrs.put(cname);
				String member = (String) ruleAction
						.getParameterValue(PARAM_MEMBER);

				if (member == null) {
					member = "cn=pwmTestUser,ou=users,ou=people,dc=malariagen,dc=net";
				}
				Attribute memberAttr = new BasicAttribute("member", member);
				attrs.put(memberAttr);
				String descrip = (String) ruleAction
						.getParameterValue(PARAM_DESCRIPTION);

				if (descrip == null) {
					descrip = groupName + "_default_description";
				}
				Attribute descripAttr = new BasicAttribute("description",
						descrip);
				attrs.put(descripAttr);

				result = ctx.createSubcontext("cn=" + groupName + ","
						+ parentContext, attrs);

			} else {
				Attributes attrs = new BasicAttributes(true); // case-ignore
				Attribute objclass = new BasicAttribute("objectclass");
				objclass.add("top");
				objclass.add("organizationalUnit");
				attrs.put(objclass);
				String descrip = (String) ruleAction
						.getParameterValue(PARAM_DESCRIPTION);

				if (descrip == null) {
					descrip = groupName + "_default_description";
				}
				Attribute descripAttr = new BasicAttribute("description",
						descrip);
				attrs.put(descripAttr);
				// Create the context
				result = ctx.createSubcontext("ou=" + groupName + ","
						+ parentContext, attrs);

			}

			// Close the contexts when we're done
			result.close();
			ctx.close();

			// Sync so that the group appears in Alfresco now
			//It works without the runAs but puts error messages in the log
			AuthenticationUtil.runAs(new RunAsWork<String>()
			{
				public String doWork() throws Exception
				{
					userRegistrySynchronizer.synchronize(false, false);
					return "";
				}
			}, AuthenticationUtil.getSystemUserName());

		} catch (NamingException e) {
			logger.error("Naming exception trying to create " + groupName, e);
		}

	}

	@Override
	protected void addParameterDefinitions(List<ParameterDefinition> paramList) {
		// Add definitions for action parameters
		paramList.add(new ParameterDefinitionImpl( // Create a new parameter
													// defintion to add to the
													// list
				PARAM_GROUP_NAME, // The name used to identify the parameter
				DataTypeDefinition.TEXT, // The parameter value type
				true, // Indicates whether the parameter is mandatory
				getParamDisplayLabel(PARAM_GROUP_NAME))); // The parameters
															// display label
		paramList.add(new ParameterDefinitionImpl( // Create a new parameter
				// defintion to add to the
				// list
				PARAM_DESCRIPTION, // The name used to identify the parameter
				DataTypeDefinition.TEXT, // The parameter value type
				true, // Indicates whether the parameter is mandatory
				getParamDisplayLabel(PARAM_DESCRIPTION))); // The parameters
		// display label
		paramList.add(new ParameterDefinitionImpl( // Create a new parameter
													// defintion to add to the
													// list
				PARAM_PARENT_CONTEXT, // The name used to identify the parameter
				DataTypeDefinition.TEXT, // The parameter value type
				true, // Indicates whether the parameter is mandatory
				getParamDisplayLabel(PARAM_PARENT_CONTEXT))); // The parameters
																// display label
		paramList.add(new ParameterDefinitionImpl( // Create a new parameter
													// defintion to add to the
													// list
				PARAM_OU, // The name used to identify the
							// parameter
				DataTypeDefinition.TEXT, // The parameter value type
				true, // Indicates whether the parameter is mandatory
				getParamDisplayLabel(PARAM_OU))); // The parameters
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
	}

	/**
	 * Sets the LDAP initial dir context factory.
	 * 
	 * @param ldapInitialDirContextFactory
	 *            the new LDAP initial dir context factory
	 */
	public void setLDAPInitialDirContextFactory(
			LDAPInitialDirContextFactory ldapInitialDirContextFactory) {
		this.ldapInitialContextFactory = ldapInitialDirContextFactory;
	}

}
