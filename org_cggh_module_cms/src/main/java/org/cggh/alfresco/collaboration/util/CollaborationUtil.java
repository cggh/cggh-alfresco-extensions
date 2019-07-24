package org.cggh.alfresco.collaboration.util;

import org.alfresco.model.ContentModel;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.repository.datatype.DefaultTypeConverter;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.repository.NodeService;

import org.cggh.model.CGGHContentModel;
import org.cggh.model.CGGHNamespaceService;

public class CollaborationUtil {
	
	public static NodeRef getCollaboration(SearchService searchService, NodeService nodeService, String alfrescoCode, boolean partialMatch) {
		StoreRef storeRef = new StoreRef(StoreRef.PROTOCOL_WORKSPACE, "SpacesStore");
		// String query = "TYPE:cm\\:person +@cm\\:email:\"" + from + "\"";
		String query = "TYPE:" + CGGHNamespaceService.COLLAB_MODEL_PREFIX + "\\:"
				+ CGGHContentModel.TYPE_COLLAB_FOLDER.getLocalName() + " AND (cm\\:name:\"" + alfrescoCode + "\")";

		ResultSet resultSet = searchService.query(storeRef, SearchService.LANGUAGE_FTS_ALFRESCO, query);
		try {
			if (resultSet.length() == 0) {
				return null;
			} else {
				for (int resNum = 0; resNum < resultSet.length(); resNum++) {
					NodeRef collabNode = resultSet.getNodeRef(resNum);
					if (nodeService.exists(collabNode)) {
						String name = DefaultTypeConverter.INSTANCE.convert(String.class,
								nodeService.getProperty(collabNode, ContentModel.PROP_NAME));
						if (partialMatch) {
							if (name.startsWith(alfrescoCode)) {
								return collabNode;
							}
						} else if (name.equals(alfrescoCode)) {
							return collabNode;
						}

					} else {
						// The Lucene index returned a dead result
					}
				}
			}
		} finally {
			if (resultSet != null) {
				resultSet.close();
			}
		}
		return null;
	}
}