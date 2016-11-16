package org.cggh.repo.security.person;

import java.io.Serializable;
import java.util.HashMap;

import org.alfresco.service.namespace.QName;

public interface AvatarService {

	void setAvatar(String personName, HashMap<QName, Serializable> personProperties, long latestTime);

}