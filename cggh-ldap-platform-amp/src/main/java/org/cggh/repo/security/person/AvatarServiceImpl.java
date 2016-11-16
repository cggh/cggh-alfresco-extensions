package org.cggh.repo.security.person;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.content.MimetypeMap;
import org.alfresco.repo.rendition.executer.AbstractRenderingEngine;
import org.alfresco.repo.rendition.executer.ImageRenderingEngine;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
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
import org.alfresco.util.PropertyCheck;
import org.alfresco.util.PropertyMap;
import org.alfresco.util.transaction.TransactionListenerAdapter;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class AvatarServiceImpl extends TransactionListenerAdapter implements AvatarService {

	/** The logger. */
	private static Log logger = LogFactory.getLog(AvatarServiceImpl.class);

	protected NodeService nodeService;

	protected ServiceRegistry serviceRegistry;

	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		this.serviceRegistry = serviceRegistry;
	}

	public void init() {
		PropertyCheck.mandatory(this, "nodeService", nodeService);
		PropertyCheck.mandatory(this, "serviceRegistry", serviceRegistry);
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
	protected void createAvatar(final NodeRef person, String avatarFile, final NodeRef avatarRef)
			throws FileNotFoundException {

		PropertyMap properties = new PropertyMap(3);

		String nodeName = (String) nodeService.getProperty(person, ContentModel.PROP_USERNAME);

		if (logger.isDebugEnabled()) {
			logger.debug("Creating/updating avatar for " + nodeName);
		}
		InputStream is = new FileInputStream(avatarFile);
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
		is = new FileInputStream(avatarFile);
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

	private boolean hasAvatarChanged(NodeRef nodeRef, String avatarFile) throws FileNotFoundException {
		boolean changed = false;
		if (nodeService.exists(nodeRef)) {
			String nodeHashType = hashType;
			ContentReader reader = serviceRegistry.getContentService().getReader(nodeRef, ContentModel.PROP_CONTENT);

			String oldHash = computeHash(reader.getContentInputStream(), nodeHashType);
			InputStream is = new FileInputStream(avatarFile);
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

	private String updateAvatar(final NodeRef personNode, final HashMap<QName, Serializable> personProperties,
			final long latestTime) {

		String avatarFile = null;
		if (personNode != null) {

			List<AssociationRef> avatorAssocs = nodeService.getTargetAssocs(personNode, ContentModel.ASSOC_AVATAR);

			NodeRef avatar = null;
			if (avatorAssocs.size() > 0) {
				AssociationRef ref = avatorAssocs.get(0);
				avatar = ref.getTargetRef();
			}
			final NodeRef avatarRef = avatar;
			// Could check lastModified (null) vs
			// ldapLastModified but, while more
			// performant,
			// leads to unpredictable behaviour
			// Not set on person so checking date on
			// avatar
			if (avatarRef != null) {
				final Date lastModified = (Date) nodeService.getProperty(avatarRef, ContentModel.PROP_MODIFIED);
				if (lastModified != null) {
					if (lastModified.getTime() < latestTime) {
						logger.debug("LDAP was modified more recently than Alfresco");
					}
				}
			}
			avatarFile = (String) personProperties.get(ContentModel.ASSOC_PREFERENCE_IMAGE);
			try {
				if (avatarRef != null) {
					if (hasAvatarChanged(avatarRef, avatarFile)) {
						String username = (String) personProperties.get(ContentModel.PROP_USERNAME);
						logger.debug("Changing avatar" + username);
						createAvatar(personNode, avatarFile, avatarRef);
					}
				} else {
					String username = (String) personProperties.get(ContentModel.PROP_USERNAME);
					logger.debug("Setting new avatar for " + username);
					createAvatar(personNode, avatarFile, avatarRef);
				}
			} catch (FileNotFoundException fnfe) {
				logger.error("could not find Temporary file" + avatarFile);
			}

		}
		return (avatarFile);

	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.cggh.repo.security.person.AvatarService#setAvatar(java.lang.String,
	 * java.util.HashMap, long)
	 */
	@Override
	public void setAvatar(final String personName, final HashMap<QName, Serializable> personProperties,
			final long latestTime) {
		// Overloading the use of cm:preferenceImage
		if (!personProperties.containsKey(ContentModel.ASSOC_PREFERENCE_IMAGE)) {
			return;
		}
		NodeRef personNode = getPersonService().getPerson(personName, false);

		String avatarFile = updateAvatar(personNode, personProperties, latestTime);

		if (avatarFile != null) {
			File af = new File(avatarFile);
			af.delete();
		}
	}

	private PersonService getPersonService() {
		return serviceRegistry.getPersonService();
	}

	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
}
