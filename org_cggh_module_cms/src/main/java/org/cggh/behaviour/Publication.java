package org.cggh.behaviour;

import static java.nio.charset.StandardCharsets.ISO_8859_1;
import static java.nio.charset.StandardCharsets.UTF_8;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.io.StringBufferInputStream;
import java.util.Map;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.node.NodeServicePolicies.OnUpdatePropertiesPolicy;
import org.alfresco.repo.policy.Behaviour;
import org.alfresco.repo.policy.Behaviour.NotificationFrequency;
import org.alfresco.repo.policy.JavaBehaviour;
import org.alfresco.repo.policy.PolicyComponent;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.datatype.DefaultTypeConverter;
import org.alfresco.service.namespace.QName;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.cggh.model.CGGHContentModel;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.HtmlUtils;
import org.springframework.web.util.UriComponentsBuilder;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

public class Publication implements OnUpdatePropertiesPolicy {

	// Dependencies
	private NodeService nodeService;
	private PolicyComponent policyComponent;

	// Behaviours
	private Behaviour onUpdateProperties;

	private static Log logger = LogFactory.getLog(Publication.class);

	public void init() {
		if (logger.isDebugEnabled()) {
			logger.debug("Initializing publication behaviors");
		}

		// Create behaviours
		this.onUpdateProperties = new JavaBehaviour(this, OnUpdatePropertiesPolicy.QNAME.getLocalName(),
				NotificationFrequency.TRANSACTION_COMMIT);

		this.policyComponent.bindClassBehaviour(OnUpdatePropertiesPolicy.QNAME, CGGHContentModel.ASPECT_PUBLICATION,
				this.onUpdateProperties);
	}

	@Override
	public void onUpdateProperties(NodeRef nodeRef, Map<QName, Serializable> before, Map<QName, Serializable> after) {
		// check the node to make sure it has the right aspect
		if (nodeService.exists(nodeRef) && nodeService.hasAspect(nodeRef, CGGHContentModel.ASPECT_PUBLICATION)) {
			String newDOI = (String) after.get(CGGHContentModel.PROP_DOI);
			Serializable oldDOI = before.get(CGGHContentModel.PROP_DOI);
			String newPMID = (String) after.get(CGGHContentModel.PROP_PMID);
			Serializable oldPMID = before.get(CGGHContentModel.PROP_PMID);
			String style = "nature";

			if (newPMID != null) {
				if (oldPMID == null || !newPMID.equals(oldPMID)) {
					String DOI = lookupIdentifier(nodeRef, (String) newPMID, "doi");
					if (DOI != null) {
						if ((!(newDOI == null || newDOI.trim().length() == 0)) && !DOI.equals(newDOI)) {
							if (logger.isWarnEnabled()) {
								logger.warn("DOI and PMID don't match:" + newDOI + " " + newPMID);
							}
						} else if (newDOI == null || newDOI.trim().length() == 0) {
							nodeService.setProperty(nodeRef, CGGHContentModel.PROP_DOI, DOI);
							newDOI = DOI;
						}
					}
				}
			}

			if (newDOI != null) {
				if (oldDOI == null || newDOI != oldDOI) {
					String pmid = lookupIdentifier(nodeRef, newDOI, "pmid");
					if (pmid != null) {
						if ((!(newPMID == null || newPMID.trim().length() == 0)) && !pmid.equals(newPMID)) {
							if (logger.isWarnEnabled()) {
								logger.warn("DOI and PMID don't match:" + newDOI + " " + newPMID);
							}
						} else if (newPMID == null || newPMID.trim().length() == 0) {
							nodeService.setProperty(nodeRef, CGGHContentModel.PROP_PMID, pmid);
							newPMID = pmid;
						}
					}
					setCitation(nodeRef, (String) newDOI, style);
				}
			} else {
				String description = DefaultTypeConverter.INSTANCE.convert(String.class,
						nodeService.getProperty(nodeRef, ContentModel.PROP_DESCRIPTION));
				//Decided not to automatically parse for DOI (which can be put into the description via the metadata extractor

			}

		}
	}

	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}

	public void setPolicyComponent(PolicyComponent policyComponent) {
		this.policyComponent = policyComponent;
	}

	private void setCitation(NodeRef nodeRef, String newValue, String style) {

		// http://citation.crosscite.org/docs.html
		// curl -LH "Accept: text/x-bibliography; style=apa"
		// http://dx.doi.org/10.1126/science.169.3946.635
		String citationText = "";

		if (!(newValue == null || newValue.trim().length() == 0)) {
			RestTemplate rest = new RestTemplate();
			HttpHeaders headers = new HttpHeaders();
			String accept = "text/x-bibliography";
			if (style == null || style.trim().length() == 0) {
				accept += "; style=nature";
			} else {
				accept += "; style=" + style;
			}
			headers.add("Accept", accept);
			String url = "http://dx.doi.org/" + newValue;

			HttpEntity<String> requestEntity = new HttpEntity<String>("", headers);
			ResponseEntity<String> responseEntity = rest.exchange(url, HttpMethod.GET, requestEntity, String.class);
			if (responseEntity.getStatusCode() == HttpStatus.OK) {
				citationText = responseEntity.getBody();
				byte ptext[] = citationText.getBytes(ISO_8859_1);
				citationText = new String(ptext, UTF_8);
			}
		}
		nodeService.setProperty(nodeRef, CGGHContentModel.PROP_CITATION, citationText);

	}

	private String lookupIdentifier(NodeRef nodeRef, String pmid, String attribute) {
		String id = null;

		if (!(pmid == null || pmid.trim().length() == 0)) {
			String url = "https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/";
			// ?db=pubmed&id="<pmid>
			// 25367300

			RestTemplate rest = new RestTemplate();
			HttpHeaders headers = new HttpHeaders();
			HttpEntity<String> requestEntity = new HttpEntity<String>(url, headers);
			UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url).queryParam("versions", "no")
					.queryParam("ids", pmid);
			ResponseEntity<String> responseEntity = rest.exchange(builder.build().encode().toUri(), HttpMethod.GET,
					requestEntity, String.class);
			if (responseEntity.getStatusCode() == HttpStatus.OK) {
				String responseXML = responseEntity.getBody();
				DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
				try {
					DocumentBuilder xmlBuilder = factory.newDocumentBuilder();
					InputStream is = new ByteArrayInputStream(responseXML.getBytes("UTF-8"));
					Document doc = xmlBuilder.parse(is);
					is.close();
					XPathFactory xPathfactory = XPathFactory.newInstance();
					XPath xpath = xPathfactory.newXPath();
					XPathExpression expr = xpath.compile("//record/@"+ attribute);
					id = expr.evaluate(doc);
				} catch (XPathExpressionException | ParserConfigurationException | SAXException | IOException e) {
					logger.error(builder.build().encode().toUri());
					logger.error(responseXML, e);
				}
			}
		}
		return id;
	}

}
