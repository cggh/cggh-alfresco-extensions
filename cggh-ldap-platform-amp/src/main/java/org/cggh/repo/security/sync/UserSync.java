package org.cggh.repo.security.sync;

import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.MutablePropertyValues;
import org.springframework.beans.PropertyValue;
import org.springframework.beans.factory.BeanNameAware;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;

public class UserSync
		implements BeanFactoryPostProcessor, BeanNameAware {

	private static final Log logger = LogFactory.getLog(UserSync.class);
	
	protected String beanName;

	protected String originalClassName;

	protected String replacementClassName;

	protected String targetBeanName;

	protected Map<String, Object> injectableProperties;
	
	public void setInjectableProperties(Map<String, Object> injectableProperties) {
		this.injectableProperties = injectableProperties;
	}

	protected boolean active;

	
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

	@Override
	public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {

		BeanDefinition beanDefinition = beanFactory.getBeanDefinition(targetBeanName);

		if (beanDefinition != null) {
			if (this.originalClassName == null || this.originalClassName.equals(beanDefinition.getBeanClassName())) {
				beanDefinition.setBeanClassName(this.replacementClassName);
			}
			final MutablePropertyValues propertyValues = beanDefinition.getPropertyValues();

			if (this.injectableProperties != null) {
				for (Map.Entry<String, Object> entry : injectableProperties.entrySet())
				{
				    final PropertyValue newValue = new PropertyValue(entry.getKey(), entry.getValue());
		            propertyValues.addPropertyValue(newValue);

				}
			}
		} else {
			logger.error("Unable to find definition for:" + targetBeanName);
		}
	}

}
