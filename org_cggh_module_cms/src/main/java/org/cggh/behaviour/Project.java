package org.cggh.behaviour;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import org.alfresco.model.ContentModel;
import org.alfresco.model.DataListModel;
import org.alfresco.repo.node.NodeServicePolicies.OnCreateAssociationPolicy;
import org.alfresco.repo.node.NodeServicePolicies.OnDeleteAssociationPolicy;
import org.alfresco.repo.node.NodeServicePolicies.OnUpdateNodePolicy;
import org.alfresco.repo.node.NodeServicePolicies.OnUpdatePropertiesPolicy;
import org.alfresco.repo.policy.Behaviour;
import org.alfresco.repo.policy.Behaviour.NotificationFrequency;
import org.alfresco.repo.policy.JavaBehaviour;
import org.alfresco.repo.policy.PolicyComponent;
import org.alfresco.service.cmr.repository.AssociationRef;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.apache.log4j.Logger;
import org.cggh.model.CGGHContentModel;

public class Project implements OnUpdatePropertiesPolicy { // OnCreateNodePolicy,

	// Dependencies
	private NodeService nodeService;
	private PolicyComponent policyComponent;

	// Behaviours
	private Behaviour onUpdateProperties;

	private Logger logger = Logger.getLogger(Project.class);

	public void init() {
		if (logger.isDebugEnabled())
			logger.debug("Initializing project behaviors");

		// Create behaviours
		this.onUpdateProperties = new JavaBehaviour(this, OnUpdatePropertiesPolicy.QNAME.getLocalName(),
				NotificationFrequency.TRANSACTION_COMMIT);

		this.policyComponent.bindClassBehaviour(OnUpdatePropertiesPolicy.QNAME,
		 DataListModel.TYPE_DATALIST_ITEM, this.onUpdateProperties);
	}

	public void updateProjects(NodeRef nodeRef) {
		
		//Name has changed so need to update all collaborations that reference this project
		List<AssociationRef> collabs = nodeService.getSourceAssocs(nodeRef, CGGHContentModel.ASSOC_PROJECTS);
		
		for (AssociationRef collab : collabs) {
			ArrayList<String> projects = new ArrayList<String>();
			List<AssociationRef> projectNodes = nodeService.getTargetAssocs(collab.getSourceRef(), CGGHContentModel.ASSOC_PROJECTS);
			for (AssociationRef child : projectNodes) {
				String projName = (String) nodeService.getProperty(child.getTargetRef(), ContentModel.PROP_NAME);
				projects.add(projName);
				if (logger.isDebugEnabled()) {
					logger.debug("Adding project:" + projName);
				}
			}
			if (logger.isDebugEnabled() && projects.isEmpty()) {
				logger.debug("No projects to add");
			}
			nodeService.setProperty(collab.getSourceRef(), CGGHContentModel.PROP_PROJECTS, projects);
		}


		return;

	}

	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}

	public void setPolicyComponent(PolicyComponent policyComponent) {
		this.policyComponent = policyComponent;
	}

	public void onDeleteAssociation(AssociationRef nodeAssocRef) {
		NodeRef nodeRef = nodeAssocRef.getTargetRef();
		//if (nodeAssocRef.getTypeQName().equals(CGGHContentModel.ASSOC_PROJECTS)) {
			updateProjects(nodeRef);
		//}
	}

	public void onCreateAssociation(AssociationRef nodeAssocRef) {
		NodeRef nodeRef = nodeAssocRef.getTargetRef();
		updateProjects(nodeRef);
		nodeRef = nodeAssocRef.getSourceRef();
		updateProjects(nodeRef);
	}

	public void onUpdateProperties(NodeRef nodeRef, Map<QName, Serializable> before, Map<QName, Serializable> after) {
		updateProjects(nodeRef);
	}

}
