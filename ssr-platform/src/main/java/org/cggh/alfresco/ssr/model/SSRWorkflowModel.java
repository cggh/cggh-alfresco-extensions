package org.cggh.alfresco.ssr.model;

import org.alfresco.service.namespace.QName;

public interface SSRWorkflowModel {

	static final QName PROP_REPORT_SAMPLES_COUNT = QName.createQName(SSRNamespaceService.SSR_MODEL_1_0_URI, "reportCount");
	static final QName PROP_EXPECTED_SAMPLES_COUNT = QName.createQName(SSRNamespaceService.SSR_MODEL_1_0_URI, "collabCount");
	static final QName PROP_DATE_FIRST_SAMPLE = QName.createQName(SSRNamespaceService.SSR_MODEL_1_0_URI, "firstSampleDate");
	static final QName PROP_DATE_LAST_SAMPLE = QName.createQName(SSRNamespaceService.SSR_MODEL_1_0_URI, "lastSampleDate");
	static final QName PROP_COUNTRIES_MISSING = QName.createQName(SSRNamespaceService.SSR_MODEL_1_0_URI, "countriesMissing");
	static final QName PROP_COUNTRIES_NO_SAMPLES = QName.createQName(SSRNamespaceService.SSR_MODEL_1_0_URI, "countriesNoSamples");
	static final QName PROP_COUNTRIES_INVALID = QName.createQName(SSRNamespaceService.SSR_MODEL_1_0_URI, "countriesInvalid");
	static final QName PROP_COLLAB_STATUS = QName.createQName(SSRNamespaceService.SSR_MODEL_1_0_URI, "collabStatus");
	static final QName PROP_REPORT_NAME = QName.createQName(SSRNamespaceService.SSR_MODEL_1_0_URI, "reportName");;

}
