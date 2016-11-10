package org.cggh.repo.security.sync.ldap;

import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.NodeService;
import org.springframework.beans.BeansException;
import org.springframework.beans.MutablePropertyValues;
import org.springframework.beans.PropertyValue;
import org.springframework.beans.factory.BeanNameAware;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.config.TypedStringValue;
import org.springframework.beans.factory.support.ManagedMap;

public class UserRegistryConfig
		implements BeanFactoryPostProcessor, BeanNameAware {

	protected NodeService nodeService;
	

	protected ServiceRegistry serviceRegistry;
	
	protected String beanName;

	protected String originalClassName;

	protected String replacementClassName;

	protected String targetBeanName;

	protected String propertyName;

	protected boolean active;

	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
	
	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		this.serviceRegistry = serviceRegistry;
	}
	
	public void setOriginalClassName(String originalClassName) {
		this.originalClassName = originalClassName;
	}

	public void setReplacementClassName(String replacementClassName) {
		this.replacementClassName = replacementClassName;
	}

	public void setTargetBeanName(String targetBeanName) {
		this.targetBeanName = targetBeanName;
	}

	public void setPropertyName(String propertyName) {
		this.propertyName = propertyName;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	@Override
	public void setBeanName(String name) {
		this.beanName = name;
	}

	@Override
	public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {

		BeanDefinition beanDefinition = beanFactory.getBeanDefinition(targetBeanName);

		if (beanDefinition != null) {

			if (this.originalClassName == null || this.originalClassName.equals(beanDefinition.getBeanClassName())) {
				beanDefinition.setBeanClassName(this.replacementClassName);
			}

			final MutablePropertyValues propertyValues = beanDefinition.getPropertyValues();
			final PropertyValue configuredValue = propertyValues.getPropertyValue(this.propertyName);
			final Object configuredValueDefinition = configuredValue.getValue();
			@SuppressWarnings("unchecked")
			final ManagedMap<TypedStringValue, TypedStringValue> mm = (ManagedMap<TypedStringValue, TypedStringValue>) configuredValueDefinition;

			ManagedMap<TypedStringValue, TypedStringValue> value = new ManagedMap<>();
			value.putAll(mm);
			value.put(new TypedStringValue("cm:preferenceImage"), new TypedStringValue("jpegPhoto"));
			final PropertyValue newValue = new PropertyValue(this.propertyName, value);
			propertyValues.addPropertyValue(newValue);
			final PropertyValue serviceValue = new PropertyValue("nodeService", this.nodeService);
			propertyValues.addPropertyValue(serviceValue);
			final PropertyValue serviceRegistryValue = new PropertyValue("serviceRegistry", this.serviceRegistry);
			propertyValues.addPropertyValue(serviceRegistryValue);
		}
	}

}
