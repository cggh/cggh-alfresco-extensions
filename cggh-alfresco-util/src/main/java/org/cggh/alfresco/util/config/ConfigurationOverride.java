package org.cggh.alfresco.util.config;

import java.util.Map;

import org.springframework.beans.BeansException;
import org.springframework.beans.MutablePropertyValues;
import org.springframework.beans.PropertyValue;
import org.springframework.beans.factory.BeanNameAware;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.config.TypedStringValue;
import org.springframework.beans.factory.support.ManagedMap;

public class ConfigurationOverride implements BeanFactoryPostProcessor, BeanNameAware {

	protected String beanName;

	protected String originalClassName;

	protected String replacementClassName;

	protected String targetBeanName;

	protected boolean active;

	protected Map<String, Object> injectableProperties;

	protected Map<String, Object> appendedProperties;

	public void setOriginalClassName(String originalClassName) {
		this.originalClassName = originalClassName;
	}

	public void setReplacementClassName(String replacementClassName) {
		this.replacementClassName = replacementClassName;
	}

	public void setTargetBeanName(String targetBeanName) {
		this.targetBeanName = targetBeanName;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	@Override
	public void setBeanName(String name) {
		this.beanName = name;
	}

	public void setInjectableProperties(Map<String, Object> injectableProperties) {
		this.injectableProperties = injectableProperties;
	}

	public void setAppendedProperties(Map<String, Object> appendedProperties) {
		this.appendedProperties = appendedProperties;
	}

	@Override
	public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {

		if (active) {
			BeanDefinition beanDefinition = beanFactory.getBeanDefinition(targetBeanName);

			if (beanDefinition != null) {

				if (this.originalClassName == null
						|| this.originalClassName.equals(beanDefinition.getBeanClassName())) {
					beanDefinition.setBeanClassName(this.replacementClassName);
				}

				final MutablePropertyValues propertyValues = beanDefinition.getPropertyValues();

				if (this.appendedProperties != null) {
					for (Map.Entry<String, Object> entry : appendedProperties.entrySet()) {
						final PropertyValue configuredValue = propertyValues.getPropertyValue(entry.getKey());
						final Object configuredValueDefinition = configuredValue.getValue();

						ManagedMap<TypedStringValue, TypedStringValue> value = new ManagedMap<>();

						// If there's an existing definition then add it to the
						// new one
						if (configuredValueDefinition != null
								&& configuredValueDefinition instanceof ManagedMap<?, ?>) {
							@SuppressWarnings("unchecked")
							final ManagedMap<TypedStringValue, TypedStringValue> mm = (ManagedMap<TypedStringValue, TypedStringValue>) configuredValueDefinition;
							value.putAll(mm);
						}

						Object newProperties = entry.getValue();
						if (newProperties != null && newProperties instanceof Map<?, ?>) {
							@SuppressWarnings("unchecked")
							Map<TypedStringValue, Object> newPropertiesMap = (Map<TypedStringValue, Object>) newProperties;
							for (Map.Entry<TypedStringValue, Object> newEntry : newPropertiesMap.entrySet()) {
								String newValue = (String) newEntry.getValue();
								value.put(newEntry.getKey(), new TypedStringValue(newValue));
							}
						}
						

						final PropertyValue newMapValue = new PropertyValue(entry.getKey(), value);

						// Replace the existing definition
						propertyValues.addPropertyValue(newMapValue);

					}
				}

				if (this.injectableProperties != null) {
					for (Map.Entry<String, Object> entry : injectableProperties.entrySet()) {
						final PropertyValue newValue = new PropertyValue(entry.getKey(), entry.getValue());
						propertyValues.addPropertyValue(newValue);

					}
				}
			}
		}
	}

}
