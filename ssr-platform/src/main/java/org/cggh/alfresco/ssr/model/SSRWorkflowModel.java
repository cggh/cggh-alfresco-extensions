package org.cggh.alfresco.ssr.model;

import org.alfresco.service.namespace.QName;

public interface SSRWorkflowModel {

	static final QName PROP_REPORT_SAMPLES_COUNT = QName.createQName(SSRNamespaceService.SSR_MODEL_1_0_URI, "reportCount");
	static final QName PROP_EXPECTED_SAMPLES_COUNT = QName.createQName(SSRNamespaceService.SSR_MODEL_1_0_URI, "collabCount");;

}
