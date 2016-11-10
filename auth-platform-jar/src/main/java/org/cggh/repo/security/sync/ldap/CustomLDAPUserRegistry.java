package org.cggh.repo.security.sync.ldap;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.ParseException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.SearchResult;

import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.rendition.executer.AbstractRenderingEngine;
import org.alfresco.repo.rendition.executer.ImageRenderingEngine;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.security.authentication.AuthenticationUtil.RunAsWork;
import org.alfresco.repo.security.sync.NodeDescription;
import org.alfresco.repo.transaction.RetryingTransactionHelper;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.rendition.RenditionDefinition;
import org.alfresco.service.cmr.rendition.RenditionService;
import org.alfresco.service.cmr.repository.AssociationRef;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.ContentService;
import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.alfresco.util.PropertyMap;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class CustomLDAPUserRegistry extends LDAPUserRegistry {

	/** The logger. */
	private static Log logger = LogFactory.getLog(CustomLDAPUserRegistry.class);

	protected NodeService nodeService;

	protected ServiceRegistry serviceRegistry;

	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		this.serviceRegistry = serviceRegistry;
	}

	//
	// See https://github.com/sujaypillai/alfchecksum
	//
	private static final String DEFAULT_HASH_TYPE = "md5";
	private static final int BUFFER_SIZE = 1 << 8;

	private String hashType = DEFAULT_HASH_TYPE;

	private String computeHash(InputStream contentStream, String hashType) {
		MessageDigest messageDigest = null;
		try {
			messageDigest = MessageDigest.getInstance(hashType);
		} catch (NoSuchAlgorithmException e) {
			logger.error("Unable to process algorithm for hashtype : " + hashType);
			return null;
		}

		messageDigest.reset();
		byte[] buffer = new byte[BUFFER_SIZE];
		int bytesRead = -1;
		try {
			while ((bytesRead = contentStream.read(buffer)) > -1) {
				messageDigest.update(buffer, 0, bytesRead);
			}
		} catch (IOException e) {
			logger.error("Unable to read content stream.", e);
			return null;
		} finally {
			try {
				contentStream.close();
			} catch (IOException e) {
			}
		}
		byte[] digest = messageDigest.digest();
		return convertByteArrayToHex(digest);
	}

	private String convertByteArrayToHex(byte[] array) {
		StringBuffer hashValue = new StringBuffer();
		for (int i = 0; i < array.length; i++) {
			String hex = Integer.toHexString(0xFF & array[i]);
			if (hex.length() == 1) {
				hashValue.append('0');
			}
			hashValue.append(hex);
		}
		return hashValue.toString().toUpperCase();
	}

	private RenditionDefinition createAction(String renderingEngineName, String renditionLocalName,
			Map<String, Serializable> parameterValues) {
		QName renditionName = QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, renditionLocalName);
		RenditionDefinition action = serviceRegistry.getRenditionService().createRenditionDefinition(renditionName,
				renderingEngineName);
		for (String paramKey : parameterValues.keySet()) {
			action.setParameterValue(paramKey, parameterValues.get(paramKey));
		}
		return action;
	}

	// src/main/resources/alfresco/templates/webscripts/org/alfresco/slingshot/profile/avatar.get.js
	// thumbnailService is deprecated
	protected void createThumbnail(NodeRef sourceNode, String name, int size) {

		Map<String, Serializable> parameterValues = new HashMap<String, Serializable>();

		parameterValues.clear();
		parameterValues.put(AbstractRenderingEngine.PARAM_MIME_TYPE, MimetypeMap.MIMETYPE_IMAGE_PNG);
		parameterValues.put(AbstractRenderingEngine.PARAM_SOURCE_CONTENT_PROPERTY, ContentModel.PROP_CONTENT);
		parameterValues.put(RenditionService.PARAM_RENDITION_NODETYPE, ContentModel.TYPE_THUMBNAIL);
		parameterValues.put(ImageRenderingEngine.PARAM_RESIZE_WIDTH, size);
		parameterValues.put(ImageRenderingEngine.PARAM_RESIZE_HEIGHT, size);
		parameterValues.put(ImageRenderingEngine.PARAM_MAINTAIN_ASPECT_RATIO, true);
		parameterValues.put(ImageRenderingEngine.PARAM_RESIZE_TO_THUMBNAIL, true);
		parameterValues.put(AbstractRenderingEngine.PARAM_RUN_AS, AuthenticationUtil.getSystemUserName());

		RenditionDefinition action = createAction(ImageRenderingEngine.NAME, name, parameterValues);
		ChildAssociationRef result = serviceRegistry.getRenditionService().render(sourceNode, action);

		nodeService.setProperty(result.getChildRef(), ContentModel.PROP_THUMBNAIL_NAME, name);
	}

	// share/share-services/src/main/resources/alfresco/templates/webscripts/org/alfresco/slingshot/profile/uploadavatar.post.js
	protected void createAvatar(final NodeRef person, final byte[] value, final NodeRef avatarRef) {

		PropertyMap properties = new PropertyMap(3);

		String nodeName = (String) nodeService.getProperty(person, ContentModel.PROP_USERNAME);

		InputStream is = new ByteArrayInputStream((byte[]) value);
		// Although the LDAP element is called jpegPhoto it might have a png or
		// ...
		String mimetype = serviceRegistry.getMimetypeService().guessMimetype(nodeName, is);
		if (!mimetype.startsWith("image/")) {
			removeAssociations(person, ContentModel.ASSOC_PREFERENCE_IMAGE);
			return;
		}

		try {
			is.close();
		} catch (IOException e) {
			logger.error("Failed to close stream while saving image", e);
		}

		if (!nodeService.hasAspect(person, ContentModel.ASPECT_PREFERENCES)) {
			nodeService.addAspect(person, ContentModel.ASPECT_PREFERENCES, properties);
		}

		// Only allowed one
		removeAssociations(person, ContentModel.ASSOC_PREFERENCE_IMAGE);

		properties.put(ContentModel.PROP_NAME, nodeName);
		ChildAssociationRef childAssoc = nodeService.createNode(person, ContentModel.ASSOC_PREFERENCE_IMAGE,
				QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, QName.createValidLocalName(nodeName)),
				ContentModel.TYPE_CONTENT, properties);

		NodeRef imageRef = childAssoc.getChildRef();
		ContentService contentService = serviceRegistry.getContentService();
		ContentWriter writer = contentService.getWriter(imageRef, ContentModel.PROP_CONTENT, true);
		writer.setMimetype(mimetype);
		is = new ByteArrayInputStream((byte[]) value);
		writer.putContent(is);
		try {
			is.close();
		} catch (IOException e) {
			logger.error("Failed to close stream while saving image", e);
		}

		String name = nodeName + "." + serviceRegistry.getMimetypeService().getExtension(mimetype);
		nodeService.setProperty(imageRef, ContentModel.PROP_NAME, name);

		removeAssociations(person, ContentModel.ASSOC_AVATAR);

		nodeService.createAssociation(person, imageRef, ContentModel.ASSOC_AVATAR);

		createThumbnail(imageRef, "avatar", 64);
		createThumbnail(imageRef, "avatar32", 32);

	}

	private List<AssociationRef> removeAssociations(NodeRef person, QName assocName) {
		List<AssociationRef> eImages = nodeService.getTargetAssocs(person, assocName);

		for (AssociationRef childAssocRef : eImages) {
			nodeService.removeAssociation(childAssocRef.getSourceRef(), childAssocRef.getTargetRef(), assocName);
			nodeService.deleteNode(childAssocRef.getTargetRef());
		}
		return eImages;
	}

	private boolean hasAvatarChanged(NodeRef nodeRef, byte[] value) {
		boolean changed = false;
		if (nodeService.exists(nodeRef)) {
			String nodeHashType = hashType;
			ContentReader reader = serviceRegistry.getContentService().getReader(nodeRef, ContentModel.PROP_CONTENT);

			String oldHash = computeHash(reader.getContentInputStream(), nodeHashType);
			InputStream is = new ByteArrayInputStream((byte[]) value);
			String newHash = computeHash(is, nodeHashType);
			try {
				is.close();
			} catch (IOException e) {
				logger.error("Failed to close is after calculating hash", e);
			}

			if (!newHash.equals(oldHash)) {
				changed = true;
			}
		}
		return changed;
	}

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
				if (attributeName.equals("jpegPhoto")) {

					Attribute attribute = ldapAttributes.get(attributeName);
					if (attribute != null) {
						updateAvatar(nodeDescription, attribute.get(0), ldapLastModified);
					}
				} else {
					Attribute attribute = ldapAttributes.get(attributeName);
					if (attribute != null) {
						String value = (String) attribute.get(0);
						if (value != null) {
							properties.put(keyQName, value);
						}
					} else {
						String defaultValue = attributeDefaults.get(key);
						if (defaultValue != null) {
							properties.put(keyQName, defaultValue);
						}
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

	private void updateAvatar(final NodeDescription nodeDescription, final Object value, final Date ldapLastModified)
			throws NamingException {

		if (value == null) {
			return;
		}
		final String username = (String) nodeDescription.getProperties().get(ContentModel.PROP_USERNAME);

		// Can't set personService directly
		final PersonService personService = serviceRegistry.getPersonService();
		final NodeRef personNode = AuthenticationUtil.runAsSystem(new RunAsWork<NodeRef>() {
			public NodeRef doWork() throws Exception {
				if (personService.personExists(username)) {
					return personService.getPerson(username, false);
				} else {
					return null;
				}
			}
		});
		if (personNode != null) {
			//Not set
			final Date lastModified = (Date) nodeService.getProperty(personNode, ContentModel.PROP_MODIFIED);

			List<AssociationRef> avatorAssocs = nodeService.getTargetAssocs(personNode, ContentModel.ASSOC_AVATAR);

			NodeRef avatar = null;
			if (avatorAssocs.size() > 0) {
				AssociationRef ref = avatorAssocs.get(0);
				avatar = ref.getTargetRef();
			}
			final NodeRef avatarRef = avatar;
			serviceRegistry.getRetryingTransactionHelper()
					.doInTransaction(new RetryingTransactionHelper.RetryingTransactionCallback<NodeRef>() {
						public NodeRef execute() throws Throwable {

							AuthenticationUtil.runAsSystem(new RunAsWork<NodeRef>() {
								public NodeRef doWork() throws Exception {
									// Could check lastModified (null) vs
									// ldapLastModified but, while more
									// performant,
									// leads to unpredictable behaviour
									if (!(lastModified == null || ldapLastModified == null)) {
										if (lastModified.before(ldapLastModified)) {
											logger.debug("LDAP was modified more recently than Alfresco");
										}
									}
									if (avatarRef != null) {
										if (hasAvatarChanged(avatarRef, (byte[]) value)) {
											logger.debug("Changing avatar for " + username);
											createAvatar(personNode, (byte[]) value, avatarRef);
										}
									} else {
										logger.debug("Setting new avatar for " + username);
										createAvatar(personNode, (byte[]) value, avatarRef);
									}
									return null;
								}

							}

					);
							return null;
						}
					});

		}
	}

	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}

}
