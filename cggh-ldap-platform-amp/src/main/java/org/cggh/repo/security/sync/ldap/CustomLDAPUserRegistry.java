package org.cggh.repo.security.sync.ldap;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStream;
import java.text.ParseException;
import java.util.Date;
import java.util.Map;

import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.SearchResult;

import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.security.sync.NodeDescription;
import org.alfresco.service.namespace.QName;
import org.alfresco.util.PropertyMap;
import org.alfresco.util.TempFileProvider;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class CustomLDAPUserRegistry extends LDAPUserRegistry {

	/** The logger. */
	private static Log logger = LogFactory.getLog(CustomLDAPUserRegistry.class);


	protected NodeDescription mapToNode(Map<String, String> attributeMapping, Map<String, String> attributeDefaults,
			SearchResult result) throws NamingException {
		NodeDescription nodeDescription = new NodeDescription(result.getNameInNamespace());
		Attributes ldapAttributes = result.getAttributes();

		// Parse the timestamp
		Attribute modifyTimestamp = ldapAttributes.get(this.modifyTimestampAttributeName);
		Date ldapLastModified = null;
		if (modifyTimestamp != null) {
			try {
				ldapLastModified = this.timestampFormat.parse(modifyTimestamp.get().toString());
				nodeDescription.setLastModified(ldapLastModified);
			} catch (ParseException e) {
				throw new AlfrescoRuntimeException("Failed to parse timestamp.", e);
			}
		}

		// Apply the mapped attributes
		PropertyMap properties = nodeDescription.getProperties();
		for (String key : attributeMapping.keySet()) {
			QName keyQName = QName.createQName(key, this.namespaceService);

			// cater for null
			String attributeName = attributeMapping.get(key);
			if (attributeName != null) {
				Attribute attribute = ldapAttributes.get(attributeName);
				if (attribute != null) {
					Object value = attribute.get(0);
					if (value != null) {
						if (value instanceof String) {
							properties.put(keyQName, (String) value);
						} else {
							try {
								setNonStringProperty(properties, keyQName, attribute);
							} catch (Exception e) {
								logger.error("failed setting property for :"
										+ (String) nodeDescription.getProperties().get(ContentModel.PROP_USERNAME));
							}
						}
					}
				} else {
					String defaultValue = attributeDefaults.get(key);
					if (defaultValue != null) {
						properties.put(keyQName, defaultValue);
					}
				}
			} else {
				String defaultValue = attributeDefaults.get(key);
				if (defaultValue != null) {
					properties.put(keyQName, defaultValue);
				}
			}
		}
		return nodeDescription;
	}

	private void setNonStringProperty(PropertyMap properties, QName keyQName, Attribute attribute) throws Exception {
		if (attribute != null) {
			byte[] value = (byte[]) attribute.get(0);
			if (value != null) {
				try {
					InputStream is = new ByteArrayInputStream(value);
					File attributeValueFile;
					attributeValueFile = TempFileProvider.createTempFile(is, keyQName.getLocalName(), "");
					is.close();
					properties.put(keyQName, attributeValueFile.getAbsolutePath());
					if (logger.isDebugEnabled()) {
						String msg = keyQName.toPrefixString();
						if (properties.get(ContentModel.PROP_USERNAME) != null) {
							msg += " for " + properties.get(ContentModel.PROP_USERNAME);
						}
						logger.debug("Set non string property:" + msg);
					}
				} catch (Exception e) {
					// Warn here, error in parent
					logger.warn("Unable to save attribute value to file:" + keyQName.getLocalName(), e);
					throw e;
				}
			}
		}
	}



}
