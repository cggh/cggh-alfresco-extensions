package org.cggh.action;

import java.util.List;

import org.alfresco.repo.action.ParameterDefinitionImpl;
import org.alfresco.repo.action.executer.ActionExecuterAbstractBase;
import org.alfresco.repo.action.executer.TestModeable;
import org.alfresco.service.cmr.action.Action;
import org.alfresco.service.cmr.action.ParameterDefinition;
import org.alfresco.service.cmr.dictionary.DataTypeDefinition;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.namespace.QName;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.InitializingBean;

public class AssociateGroupActionExecuter extends ActionExecuterAbstractBase
		implements InitializingBean, TestModeable {

	private static final String PARAM_GROUP_NAME = "group";
	private static final String PARAM_ASSOC_NAME = "association_name";
	private static final String PARAM_ASSOC_NAMESPACE = "association_namespace";

	private static final String DEFAULT_NAMESPACE = "http://alfresco.cggh.org/model/custom/1.0";

	private static Log logger = LogFactory
			.getLog(AssociateGroupActionExecuter.class);


	private NodeService nodeService;

	private AuthorityService authorityService;

	private String namespace;

	public void setNamespace(String namespace) {
		this.namespace = namespace;
	}


	@Override
	public boolean isTestMode() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public void setTestMode(boolean arg0) {
		// TODO Auto-generated method stub

	}

	@Override
	public void afterPropertiesSet() throws Exception {

		if (namespace == null || namespace.length() == 0) {
			namespace = DEFAULT_NAMESPACE;
		}
	}

	@Override
	protected void executeImpl(Action ruleAction, NodeRef actionedOn) {

		if (nodeService.exists(actionedOn) == false) {
			return;
		}

		if (logger.isDebugEnabled()) {
			logger.debug(ruleAction.getParameterValues());
		}

		String groupName = (String) ruleAction
				.getParameterValue(PARAM_GROUP_NAME);
		NodeRef groupRef = authorityService.getAuthorityNodeRef(groupName);
		
		String associationName = (String) ruleAction
				.getParameterValue(PARAM_ASSOC_NAME);
		String associationNamespace = (String) ruleAction
				.getParameterValue(PARAM_ASSOC_NAMESPACE);

		if (associationNamespace == null) {
			associationNamespace = namespace;
		}

		if (logger.isDebugEnabled()) {
			logger.debug("Creating association:" + actionedOn + "#" + groupName
					+ "#" + groupRef + "#" + associationNamespace + "#"
					+ associationName);
		}
		nodeService.createAssociation(actionedOn, groupRef,
				QName.createQName(associationNamespace, associationName));

	}

	public void setAuthorityService(AuthorityService authorityService) {
		this.authorityService = authorityService;
	}

	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
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
				PARAM_ASSOC_NAME, // The name used to identify the parameter
				DataTypeDefinition.TEXT, // The parameter value type
				true, // Indicates whether the parameter is mandatory
				getParamDisplayLabel(PARAM_ASSOC_NAME))); // The parameters
															// display label
		paramList.add(new ParameterDefinitionImpl( // Create a new parameter
													// defintion to add to the
													// list
				PARAM_ASSOC_NAMESPACE, // The name used to identify the
										// parameter
				DataTypeDefinition.TEXT, // The parameter value type
				false, // Indicates whether the parameter is mandatory
				getParamDisplayLabel(PARAM_ASSOC_NAMESPACE))); // The parameters
																// display label
	}

}
