package org.cggh.web.extensibility;

import java.util.Map;

import org.alfresco.web.extensibility.SlingshotEvaluatorUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.extensions.surf.RequestContext;
import org.springframework.extensions.surf.extensibility.ExtensionModuleEvaluator;

/*
 * You might think you could use evaluator.doclib.metadata.nodeType
 * but that's a different type of Evaluator.
 * 
 * It's surprising how widely this is called e.g. when a Create dialog is retrieved
 * from the forms service e.g.
 * /share/service/components/form?itemKind=type&itemId=cm:folder&destination=workspace://SpacesStore/4dc219a4-00eb-4293-a622-4e12dea9d331&mode=create&submitType=json&formId=doclib-common&showCancelButton=true&htmlid=template_x002e_documentlist_v2_x002e_documentlibrary_x0023_default-createFolder
 */
public class TypeSubComponentEvaluator implements ExtensionModuleEvaluator {

	private static Log logger = LogFactory.getLog(TypeSubComponentEvaluator.class);

	private static final String TYPE = "nodetype";
	private static final String NEGATE = "negate";

	protected SlingshotEvaluatorUtil util = null;

	public void setSlingshotEvaluatorUtil(SlingshotEvaluatorUtil slingshotExtensibilityUtil) {
		this.util = slingshotExtensibilityUtil;
	}

	public boolean applyModule(RequestContext context, Map<String, String> evaluationProperties) {

		String requestedType = evaluationProperties.get(TYPE);
		boolean resultSuccess = evaluationProperties.get(NEGATE) != null ? false : true;

		if (null == requestedType)
			return !resultSuccess;

		Map<String, String> uriTokens = context.getUriTokens();
		String nodeRef = uriTokens.get("nodeRef");
		if (nodeRef == null) {
			nodeRef = context.getParameter("nodeRef");
		}
		
		// This is a bit dubious - it seems that the comments component only has
		// the ref as part of the URL
		// hence nodeRef is null
		// Could attempt to parse it out
		if (nodeRef == null) {
			return !resultSuccess;
		}

		if (nodeRef.indexOf("//") < 0) {
			return !resultSuccess;
		}
		String url = "/api/metadata?nodeRef=" + nodeRef;
		JSONObject response = util.jsonGet(url);
		try {
			//If it's not a valid nodeRef
			//nodeRef could be e.g. cm:folder
			if (response == null) {
				return resultSuccess;
			}
			String type = response.getString("type");
			if (requestedType.equals(type)) {
				return resultSuccess;
			}
		} catch (JSONException e) {
			logger.error("Unable to get type", e);
		}

		return !resultSuccess;
	}

	public String[] getRequiredProperties() {
		String[] props = { TYPE, NEGATE };
		return props;
	}
}