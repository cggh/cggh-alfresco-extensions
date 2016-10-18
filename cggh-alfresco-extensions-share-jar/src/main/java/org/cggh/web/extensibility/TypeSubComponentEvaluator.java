package org.cggh.web.extensibility;

import java.net.URLEncoder;
import java.util.Map;

import javax.xml.parsers.DocumentBuilderFactory;

import org.springframework.extensions.surf.RequestContext;
import org.springframework.extensions.surf.ServletUtil;
import org.springframework.extensions.surf.exception.ConnectorServiceException;
import org.springframework.extensions.surf.extensibility.ExtensionModuleEvaluator;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.connector.Connector;
import org.springframework.extensions.webscripts.connector.Response;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

public class TypeSubComponentEvaluator implements ExtensionModuleEvaluator {

    private static final String TYPE = "nodetype";
	private static final String NEGATE = "negate";

	@Override
    public boolean applyModule(RequestContext context,
			Map<String, String> evaluationProperties) {

        String requestedType = evaluationProperties.get(TYPE);
        boolean resultSuccess = evaluationProperties.get(NEGATE) != null ? false : true;

        if (null == requestedType)
            return !resultSuccess;

        Map<String, String> uriTokens = context.getUriTokens();
        String nodeRef = uriTokens.get("nodeRef");
        if (nodeRef == null) {
            nodeRef = context.getParameter("nodeRef");
        }

        if (nodeRef == null) {
        	nodeRef = context.getParameter("itemId");
        }
        //This is a bit dubious - it seems that the comments component only has the ref as part of the URL
        //hence nodeRef is null
        //Could attempt to parse it out
        if (nodeRef == null) {
        	return resultSuccess;
        }
        try {

            final Connector conn = context
                    .getServiceRegistry()
                    .getConnectorService()
                    .getConnector("alfresco", context.getUserId(),
                            ServletUtil.getSession());
            
            final Response response = conn.call("/api/node/"
                    + nodeRef.replace(":/", ""));
            if (response.getStatus().getCode() == Status.STATUS_OK) {

                String type = parseReponse(response);

                if (requestedType.equals(type))
                    return resultSuccess;
            } else {
                return !resultSuccess;
            }
        } catch (ConnectorServiceException cse) {
            cse.printStackTrace();
            return !resultSuccess;
        }

        return !resultSuccess;
    }

    private String parseReponse(Response response) {
        try {
            Document dom = DocumentBuilderFactory.newInstance()
                    .newDocumentBuilder().parse(response.getResponseStream());
            NodeList list = dom.getElementsByTagName("cmis:propertyId");
            int len = list.getLength();

            for (int i = 0; i < len; i++) {
                Element element = (Element) list.item(i);
                String propertyName = element
                        .getAttribute("propertyDefinitionId");
                String objectTypeId = null;
                if (propertyName.equals("cmis:objectTypeId")) {
                    objectTypeId = ((Element)(element.getElementsByTagName("cmis:value")
                            .item(0))).getFirstChild().getNodeValue();
                    objectTypeId = objectTypeId.replaceAll("F:", "");
                }
                if (objectTypeId == null) {
                    continue;
                }
                return objectTypeId;
            }
        } catch (Exception exc) {
            exc.printStackTrace();
        }
        return null;
    }

	@Override
	public String[] getRequiredProperties() {
		String[] props = { TYPE, NEGATE };
		return props;
	}
}