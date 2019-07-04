package org.cggh.alfresco.collaboration.action;

import java.util.List;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.action.ParameterDefinitionImpl;
import org.alfresco.repo.action.executer.ActionExecuterAbstractBase;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.action.Action;
import org.alfresco.service.cmr.action.ParameterDefinition;
import org.alfresco.service.cmr.dictionary.DataTypeDefinition;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileNotFoundException;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.search.SearchService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.cggh.alfresco.collaboration.util.CollaborationUtil;

public class ProcessIncomingMail extends ActionExecuterAbstractBase {

	private static Log logger = LogFactory.getLog(ProcessIncomingMail.class);

	private NodeService nodeService;
	private FileFolderService fileFolderService;

	public NodeService getNodeService() {
		return nodeService;
	}

	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}

	public FileFolderService getFileFolderService() {
		return fileFolderService;
	}

	public void setFileFolderService(FileFolderService fileFolderService) {
		this.fileFolderService = fileFolderService;
	}

	public SearchService getSearchService() {
		return searchService;
	}

	public void setSearchService(SearchService searchService) {
		this.searchService = searchService;
	}

	private SearchService searchService;

	private static final String PARAM_STUDY_ID_ATTR = "studyId";
	private static final String PARAM_DEST_NAME_ATTR = "dest";

	@Override
	protected void executeImpl(Action action, NodeRef actionedUponNodeRef) {
		
		String studyId = (String) action.getParameterValue(PARAM_STUDY_ID_ATTR);
		
		if (studyId == null || studyId.length() == 0) {
			logger.info("No studyId parameter supplied");
			return;
		}

		
		String subFolderName = (String) action.getParameterValue(PARAM_DEST_NAME_ATTR);

		if (subFolderName == null || subFolderName.length() == 0) {
			subFolderName = "Emails";
		}

		AuthenticationUtil.pushAuthentication();
		try {
			AuthenticationUtil.setRunAsUserSystem();
			try {
				NodeRef studyFolderNodeRef = CollaborationUtil.getCollaboration(searchService, nodeService, studyId,
						true);
				NodeRef destinationParent = nodeService.getChildByName(studyFolderNodeRef, ContentModel.ASSOC_CONTAINS,
						subFolderName);
				if (destinationParent != null) {
					fileFolderService.move(actionedUponNodeRef, destinationParent, null);
				} else {
					logger.info("No destination folder:" + subFolderName + " found for study:" + studyId);
				}
			} catch (FileNotFoundException e) {
				// Do nothing
			}
		} finally {
			AuthenticationUtil.popAuthentication();
		}
	}

	@Override
	protected void addParameterDefinitions(List<ParameterDefinition> paramList) {
		paramList.add(new ParameterDefinitionImpl( // Create a new parameter
				// definition to add to the
				// list
				PARAM_STUDY_ID_ATTR, // The name used to identify the parameter
				DataTypeDefinition.TEXT, // The parameter value type
				true, // Indicates whether the parameter is mandatory
				getParamDisplayLabel(PARAM_STUDY_ID_ATTR))); // The parameters
		paramList.add(new ParameterDefinitionImpl( // Create a new parameter
				// definition to add to the
				// list
				PARAM_DEST_NAME_ATTR, // The name used to identify the parameter
				DataTypeDefinition.TEXT, // The parameter value type
				false, // Indicates whether the parameter is mandatory
				getParamDisplayLabel(PARAM_DEST_NAME_ATTR))); // The parameters
	}

}
