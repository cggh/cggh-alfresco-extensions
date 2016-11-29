package org.cggh.behaviour;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.node.NodeServicePolicies.OnCreateAssociationPolicy;
import org.alfresco.repo.node.NodeServicePolicies.OnDeleteAssociationPolicy;
import org.alfresco.repo.node.NodeServicePolicies.OnUpdatePropertiesPolicy;
import org.alfresco.repo.policy.Behaviour;
import org.alfresco.repo.policy.Behaviour.NotificationFrequency;
import org.alfresco.repo.policy.JavaBehaviour;
import org.alfresco.repo.policy.PolicyComponent;
import org.alfresco.service.cmr.repository.AssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.datatype.DefaultTypeConverter;
import org.alfresco.service.namespace.QName;
import org.alfresco.util.PropertyMap;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.cggh.model.CGGHContentModel;

public class CollaborationFolder implements OnUpdatePropertiesPolicy {

	// Dependencies
	private NodeService nodeService;
	private PolicyComponent policyComponent;

	// Behaviours
	private Behaviour onUpdateProperties;

	private static Log logger = LogFactory.getLog(CollaborationFolder.class);

	public void init() {
		if (logger.isDebugEnabled())
			logger.debug("Initializing project behaviors");

		// Create behaviours
		this.onUpdateProperties = new JavaBehaviour(this, OnUpdatePropertiesPolicy.QNAME.getLocalName(),
				NotificationFrequency.TRANSACTION_COMMIT);

		this.policyComponent.bindClassBehaviour(OnUpdatePropertiesPolicy.QNAME, CGGHContentModel.TYPE_COLLAB_FOLDER,
				this.onUpdateProperties);

		policyComponent.bindAssociationBehaviour(OnCreateAssociationPolicy.QNAME, CGGHContentModel.ASPECT_COLLABORATION,
				CGGHContentModel.ASSOC_PROJECTS, new JavaBehaviour(this, "onCreateProjectAssociation"));
		policyComponent.bindAssociationBehaviour(OnCreateAssociationPolicy.QNAME, CGGHContentModel.ASPECT_COLLABORATION,
				CGGHContentModel.ASSOC_LIAISON, new JavaBehaviour(this, "onCreateLiaisonAssociation"));
		policyComponent.bindAssociationBehaviour(OnCreateAssociationPolicy.QNAME, CGGHContentModel.ASPECT_COLLABORATION,
				CGGHContentModel.ASSOC_COLLABORATION_DOC, new JavaBehaviour(this, "onCreateCollabDocAssociation"));

		policyComponent.bindAssociationBehaviour(OnDeleteAssociationPolicy.QNAME, CGGHContentModel.ASPECT_COLLABORATION,
				CGGHContentModel.ASSOC_PROJECTS, new JavaBehaviour(this, "onDeleteProjectAssociation"));
		policyComponent.bindAssociationBehaviour(OnDeleteAssociationPolicy.QNAME, CGGHContentModel.ASPECT_COLLABORATION,
				CGGHContentModel.ASSOC_LIAISON, new JavaBehaviour(this, "onDeleteLiaisonAssociation"));
		policyComponent.bindAssociationBehaviour(OnDeleteAssociationPolicy.QNAME, CGGHContentModel.ASPECT_COLLABORATION,
				CGGHContentModel.ASSOC_COLLABORATION_DOC, new JavaBehaviour(this, "onDeleteCollabDocAssociation"));

	}

	public void updateProjects(NodeRef nodeRef) {

		// check the parent to make sure it has the right aspect
		if (nodeService.exists(nodeRef) && nodeService.hasAspect(nodeRef, CGGHContentModel.ASPECT_COLLABORATION)) {
			if (logger.isDebugEnabled()) {
				logger.debug("Collaboration Folder behaviour for:" + nodeRef);
			}
			if (!nodeService.hasAspect(nodeRef, CGGHContentModel.ASPECT_COLLABORATION_DATA)) {
				PropertyMap properties = new PropertyMap();
				nodeService.addAspect(nodeRef, CGGHContentModel.ASPECT_COLLABORATION_DATA, properties);
			}
		} else {

			if (logger.isDebugEnabled()) {
				logger.debug("No collaboration Folder behaviour for:" + nodeRef);
			}
			return;

		}

		Set<QName> childNodeTypeQNames = new TreeSet<QName>();
		childNodeTypeQNames.add(CGGHContentModel.ASSOC_PROJECTS);

		List<AssociationRef> children = nodeService.getTargetAssocs(nodeRef, CGGHContentModel.ASSOC_PROJECTS);

		ArrayList<String> projects = new ArrayList<String>();
		for (AssociationRef child : children) {
			String projName = (String) nodeService.getProperty(child.getTargetRef(), ContentModel.PROP_NAME);
			projects.add(projName);
			if (logger.isDebugEnabled()) {
				logger.debug("Adding project:" + projName);
			}
		}

		if (logger.isDebugEnabled() && projects.isEmpty()) {
			logger.debug("No projects to add");
			nodeService.removeProperty(nodeRef, CGGHContentModel.PROP_PROJECTS);
		} else {
			nodeService.setProperty(nodeRef, CGGHContentModel.PROP_PROJECTS, projects);
		}
		return;

	}

	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}

	public void setPolicyComponent(PolicyComponent policyComponent) {
		this.policyComponent = policyComponent;
	}

	public void onDeleteProjectAssociation(AssociationRef nodeAssocRef) {
		NodeRef nodeRef = nodeAssocRef.getSourceRef();
		if (nodeAssocRef.getTypeQName().equals(CGGHContentModel.ASSOC_PROJECTS)) {
			updateProjects(nodeRef);
		}
	}

	public void onDeleteLiaisonAssociation(AssociationRef nodeAssocRef) {
		NodeRef nodeRef = nodeAssocRef.getSourceRef();
		if (nodeService.hasAspect(nodeRef, CGGHContentModel.ASPECT_COLLABORATION_DATA)) {
			nodeService.setProperty(nodeRef, CGGHContentModel.PROP_LIAISON, null);
		}
	}

	public void onDeleteCollabDocAssociation(AssociationRef nodeAssocRef) {
		NodeRef nodeRef = nodeAssocRef.getTargetRef();
		if (nodeService.exists(nodeRef) && nodeService.hasAspect(nodeRef, CGGHContentModel.ASPECT_COLLABORATION_DOC)) {
			nodeService.removeAspect(nodeRef, CGGHContentModel.ASPECT_COLLABORATION_DOC);
		}
		if (nodeService.exists(nodeRef) && nodeService.hasAspect(nodeRef, CGGHContentModel.ASPECT_COLLABORATION_DATA)) {
			setCollaborationData(nodeRef, CGGHContentModel.PROP_COLLAB_ID, null);
			setCollaborationData(nodeRef, CGGHContentModel.PROP_PARENT_COLLAB_STATUS, null);
			setCollaborationData(nodeRef, CGGHContentModel.PROP_PROJECTS, null);
			nodeService.removeAspect(nodeRef, CGGHContentModel.ASPECT_COLLABORATION_DATA);
		}

	}

	public void onCreateProjectAssociation(AssociationRef nodeAssocRef) {
		NodeRef nodeRef = nodeAssocRef.getSourceRef();
		if (nodeAssocRef.getTypeQName().equals(CGGHContentModel.ASSOC_PROJECTS)) {
			updateProjects(nodeRef);
		}
	}

	public void onCreateLiaisonAssociation(AssociationRef nodeAssocRef) {
		NodeRef nodeRef = nodeAssocRef.getSourceRef();
		String id = DefaultTypeConverter.INSTANCE.convert(String.class,
				nodeService.getProperty(nodeAssocRef.getTargetRef(), ContentModel.PROP_USERNAME));
		if (nodeService.hasAspect(nodeRef, CGGHContentModel.ASPECT_COLLABORATION_DATA)) {
			nodeService.setProperty(nodeRef, CGGHContentModel.PROP_LIAISON, id);
		} else {
			PropertyMap properties = new PropertyMap();
			properties.put(CGGHContentModel.PROP_LIAISON, id);
			nodeService.addAspect(nodeRef, CGGHContentModel.ASPECT_COLLABORATION_DATA, properties);
			
		}

	}

	public void onCreateCollabDocAssociation(AssociationRef nodeAssocRef) {
		NodeRef nodeRef = nodeAssocRef.getTargetRef();
		String id = DefaultTypeConverter.INSTANCE.convert(String.class,
				nodeService.getProperty(nodeAssocRef.getSourceRef(), ContentModel.PROP_NAME));
		String status = DefaultTypeConverter.INSTANCE.convert(String.class,
				nodeService.getProperty(nodeAssocRef.getSourceRef(), CGGHContentModel.PROP_COLLAB_STATUS));
		Serializable projects = nodeService.getProperty(nodeAssocRef.getSourceRef(), CGGHContentModel.PROP_PROJECTS);
		setCollaborationData(nodeRef, CGGHContentModel.PROP_COLLAB_ID, id);
		setCollaborationData(nodeRef, CGGHContentModel.PROP_PARENT_COLLAB_STATUS, status);
		setCollaborationData(nodeRef, CGGHContentModel.PROP_PROJECTS, projects);
	}

	private void setCollaborationData(NodeRef nodeRef, QName property, Serializable projects) {
		if (nodeService.exists(nodeRef) && !nodeService.hasAspect(nodeRef, CGGHContentModel.ASPECT_COLLABORATION_DOC)) {
			nodeService.addAspect(nodeRef, CGGHContentModel.ASPECT_COLLABORATION_DOC, null);
		}

		if (nodeService.hasAspect(nodeRef, CGGHContentModel.ASPECT_COLLABORATION_DATA)) {
			nodeService.setProperty(nodeRef, property, projects);
		} else {
			PropertyMap properties = new PropertyMap(3);
			properties.put(property, projects);
			nodeService.addAspect(nodeRef, CGGHContentModel.ASPECT_COLLABORATION_DATA, properties);
		}
	}

	public void onUpdateProperties(NodeRef nodeRef, Map<QName, Serializable> before, Map<QName, Serializable> after) {
		// check the node to make sure it has the right aspect
		if (nodeService.exists(nodeRef) && nodeService.hasAspect(nodeRef, CGGHContentModel.ASPECT_COLLABORATION)) {
			updateCollaborationProperty(nodeRef, before, after, ContentModel.PROP_NAME,
					CGGHContentModel.PROP_COLLAB_ID);

			updateCollaborationProperty(nodeRef, before, after, CGGHContentModel.PROP_COLLAB_STATUS,
					CGGHContentModel.PROP_PARENT_COLLAB_STATUS);
			updateCollaborationProperty(nodeRef, before, after, CGGHContentModel.PROP_PROJECTS,
					CGGHContentModel.PROP_PROJECTS);

		}
	}

	private void updateCollaborationProperty(NodeRef nodeRef, Map<QName, Serializable> before,
			Map<QName, Serializable> after, QName parentPropName, QName collabPropName) {
		Serializable newValue = after.get(parentPropName);
		Serializable oldValue = before.get(parentPropName);
		if ((oldValue == null && newValue != null) || (oldValue != null && newValue == null)
				|| (oldValue != null && newValue != null && !oldValue.equals(newValue))) {
			List<AssociationRef> children = nodeService.getTargetAssocs(nodeRef,
					CGGHContentModel.ASSOC_COLLABORATION_DOC);
			for (AssociationRef child : children) {
				setCollaborationData(child.getTargetRef(), collabPropName, newValue);
			}
		}
	}

}
