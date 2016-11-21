package org.cggh.model;

import org.alfresco.service.namespace.QName;

public interface CGGHContentModel {

	static final QName TYPE_COLLAB_FOLDER = QName.createQName(CGGHNamespaceService.COLLAB_MODEL_1_0_URI, "collaborationFolder");
	static final QName TYPE_PROJECT = QName.createQName(CGGHNamespaceService.COLLAB_MODEL_1_0_URI, "project");
	
	static final QName ASPECT_COLLABORATION = QName.createQName(CGGHNamespaceService.COLLAB_MODEL_1_0_URI, "collaboration");
	static final QName ASPECT_COLLABORATION_DATA = QName.createQName(CGGHNamespaceService.COLLAB_MODEL_1_0_URI, "collaborationData");
	static final QName ASPECT_COLLABORATION_DOC = QName.createQName(CGGHNamespaceService.COLLAB_MODEL_1_0_URI, "collaborationDocument");
	static final QName ASPECT_PUBLICATION =  QName.createQName(CGGHNamespaceService.COLLAB_MODEL_1_0_URI, "publicationData");
	
	static final QName ASSOC_PROJECTS = QName.createQName(CGGHNamespaceService.COLLAB_MODEL_1_0_URI, "projectsdl");
	static final QName ASSOC_COLLABORATION_DOC = QName.createQName(CGGHNamespaceService.COLLAB_MODEL_1_0_URI, "collaborationDoc");
	static final QName ASSOC_LIAISON = QName.createQName(CGGHNamespaceService.COLLAB_MODEL_1_0_URI, "liaison");
	
	static final QName PROP_SAMPLES_EXPECTED = QName.createQName(CGGHNamespaceService.COLLAB_MODEL_1_0_URI, "samplesExpected");
	static final QName PROP_SAMPLES_PROCESSED = QName.createQName(CGGHNamespaceService.COLLAB_MODEL_1_0_URI, "samplesProcessed");
	static final QName PROP_PROJECTS = QName.createQName(CGGHNamespaceService.COLLAB_MODEL_1_0_URI, "projectsText");
	static final QName PROP_LIAISON = QName.createQName(CGGHNamespaceService.COLLAB_MODEL_1_0_URI, "liaisonUsername");
	static final QName PROP_COLLAB_ID = QName.createQName(CGGHNamespaceService.COLLAB_MODEL_1_0_URI, "collaborationID");
	static final QName PROP_COLLAB_STATUS = QName.createQName(CGGHNamespaceService.COLLAB_MODEL_1_0_URI, "collaborationStatus");
	static final QName PROP_PARENT_COLLAB_STATUS = QName.createQName(CGGHNamespaceService.COLLAB_MODEL_1_0_URI, "parentCollaborationStatus");
	
	static final QName PROP_DOI = QName.createQName(CGGHNamespaceService.COLLAB_MODEL_1_0_URI, "DOI");
	static final QName PROP_PMID = QName.createQName(CGGHNamespaceService.COLLAB_MODEL_1_0_URI, "PMID");
	static final QName PROP_CITATION = QName.createQName(CGGHNamespaceService.COLLAB_MODEL_1_0_URI, "citationText");
}
