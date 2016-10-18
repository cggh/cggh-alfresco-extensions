<?xml version='1.0' encoding='UTF-8'?>
<web-app xmlns="http://java.sun.com/xml/ns/j2ee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation="http://java.sun.com/xml/ns/j2ee http://java.sun.com/xml/ns/j2ee/web-app_2_4.xsd" version="2.4">

   <display-name>Customized Alfresco Project Slingshot</display-name>
   <description>Alfresco Project Slingshot application</description>
   
   <context-param>
      <param-name>org.jboss.jbossfaces.WAR_BUNDLES_JSF_IMPL</param-name>
      <param-value>true</param-value>
   </context-param>

   <context-param>
      <param-name>configurationStrategy</param-name>
      <param-value>${java.cas.client.config.strategy}</param-value>
   </context-param>

   <context-param>
      <param-name>configFileLocation</param-name>
      <param-value>${java.cas.client.config.location}/etc/java-cas-client.properties</param-value>
   </context-param>
   
   <!-- Spring Application Context location and context class -->
   <context-param>
      <description>Spring config file location</description>
      <param-name>contextConfigLocation</param-name>
      <param-value>classpath:web-application-config.xml</param-value>
   </context-param>

   <filter>
      <description>MT authentication support</description>
      <filter-name>MTAuthentationFilter</filter-name>
      <filter-class>org.alfresco.web.site.servlet.MTAuthenticationFilter</filter-class>
   </filter>
   
   <filter>
      <description>Redirects view and service URLs to the dispatcher servlet.</description>
      <filter-name>UrlRewriteFilter</filter-name>
      <filter-class>org.tuckey.web.filters.urlrewrite.UrlRewriteFilter</filter-class>
   </filter>
   
   <filter>
      <description>Share SSO authentication support filter.</description>
      <filter-name>Authentication Filter</filter-name>
      <filter-class>org.alfresco.web.site.servlet.SSOAuthenticationFilter</filter-class>
      <init-param>
         <param-name>endpoint</param-name>
         <param-value>alfresco</param-value>
      </init-param>
   </filter>
   <filter>
      <filter-name>CAS Authentication Filter</filter-name>
      <filter-class>org.jasig.cas.client.authentication.AuthenticationFilter</filter-class>
<!--
      <init-param>
          <param-name>casServerLoginUrl</param-name>
          <param-value>${cas.server.prefix}/login</param-value>
      </init-param>
      <init-param>
          <param-name>serverName</param-name>
          <param-value>${share.server.name}</param-value>
      </init-param>
-->
   </filter>
   <filter>
      <filter-name>CAS Validation Filter</filter-name>
      <filter-class>org.jasig.cas.client.validation.Cas30ProxyReceivingTicketValidationFilter</filter-class>
<!--
      <init-param>
          <param-name>casServerUrlPrefix</param-name>
          <param-value>${cas.server.prefix}</param-value>
      </init-param>
      <init-param>
          <param-name>serverName</param-name>
          <param-value>${share.server.name}</param-value>
      </init-param>
-->
   </filter>

   <filter>
      <filter-name>CAS HttpServletRequest Wrapper Filter</filter-name>
      <filter-class>org.jasig.cas.client.util.HttpServletRequestWrapperFilter</filter-class>
   </filter>

   <filter>
      <description>Share CSRF Token filter. Checks for a session based CSRF token in request headers (or form parameters) based on config.</description>
      <filter-name>CSRF Token Filter</filter-name>
      <filter-class>org.alfresco.web.site.servlet.CSRFFilter</filter-class>
   </filter>

   <filter>
      <description>Share Security Headers filter. Adds security response headers based on config.</description>
      <filter-name>Security Headers Filter</filter-name>
      <filter-class>org.alfresco.web.site.servlet.SecurityHeadersFilter</filter-class>
   </filter>

   <filter-mapping>
      <filter-name>MTAuthentationFilter</filter-name>
      <url-pattern>/page/*</url-pattern>
   </filter-mapping>
   
   <filter-mapping>
      <filter-name>MTAuthentationFilter</filter-name>
      <url-pattern>/p/*</url-pattern>
   </filter-mapping>
   
   <filter-mapping>
      <filter-name>MTAuthentationFilter</filter-name>
      <url-pattern>/proxy/*</url-pattern>
   </filter-mapping>
   
   <filter-mapping>
      <filter-name>CAS Authentication Filter</filter-name>
      <url-pattern>/page/*</url-pattern>
   </filter-mapping>
   
   <filter-mapping>
      <filter-name>CAS Authentication Filter</filter-name>
      <url-pattern>/p/*</url-pattern>
   </filter-mapping>
   
   <filter-mapping>
      <filter-name>CAS Authentication Filter</filter-name>
      <url-pattern>/proxy/*</url-pattern>
   </filter-mapping>

   <filter-mapping>
      <filter-name>CAS Authentication Filter</filter-name>
      <url-pattern>/service/*</url-pattern>
   </filter-mapping>

   <filter-mapping>
      <filter-name>CAS Validation Filter</filter-name>
      <url-pattern>/page/*</url-pattern>
   </filter-mapping>
   
   <filter-mapping>
      <filter-name>CAS Validation Filter</filter-name>
      <url-pattern>/p/*</url-pattern>
   </filter-mapping>
   
   <filter-mapping>
      <filter-name>CAS Validation Filter</filter-name>
      <url-pattern>/proxy/*</url-pattern>
   </filter-mapping>

   <filter-mapping>
      <filter-name>CAS Validation Filter</filter-name>
      <url-pattern>/service/*</url-pattern>
   </filter-mapping>

   <filter-mapping>
      <filter-name>CAS HttpServletRequest Wrapper Filter</filter-name>
      <url-pattern>/page/*</url-pattern>
   </filter-mapping>
   
   <filter-mapping>
      <filter-name>CAS HttpServletRequest Wrapper Filter</filter-name>
      <url-pattern>/p/*</url-pattern>
   </filter-mapping>
   
   <filter-mapping>
      <filter-name>CAS HttpServletRequest Wrapper Filter</filter-name>
      <url-pattern>/proxy/*</url-pattern>
   </filter-mapping>

   <filter-mapping>
      <filter-name>CAS HttpServletRequest Wrapper Filter</filter-name>
      <url-pattern>/service/*</url-pattern>
   </filter-mapping>

   <filter-mapping>
      <filter-name>Authentication Filter</filter-name>
      <url-pattern>/page/*</url-pattern>
   </filter-mapping>
   
   <filter-mapping>
      <filter-name>Authentication Filter</filter-name>
      <url-pattern>/p/*</url-pattern>
   </filter-mapping>
   
   <filter-mapping>
      <filter-name>Authentication Filter</filter-name>
      <url-pattern>/proxy/*</url-pattern>
   </filter-mapping>

   <filter-mapping>
      <filter-name>Authentication Filter</filter-name>
      <url-pattern>/service/*</url-pattern>
   </filter-mapping>

   <filter-mapping>
      <filter-name>CSRF Token Filter</filter-name>
      <url-pattern>/page/*</url-pattern>
   </filter-mapping>

   <filter-mapping>
      <filter-name>CSRF Token Filter</filter-name>
      <url-pattern>/p/*</url-pattern>
   </filter-mapping>

   <filter-mapping>
      <filter-name>CSRF Token Filter</filter-name>
      <url-pattern>/proxy/*</url-pattern>
   </filter-mapping>

   <filter-mapping>
      <filter-name>CSRF Token Filter</filter-name>
      <url-pattern>/service/*</url-pattern>
   </filter-mapping>

   <filter-mapping>
      <filter-name>Security Headers Filter</filter-name>
      <url-pattern>/page/*</url-pattern>
   </filter-mapping>

   <filter-mapping>
      <filter-name>Security Headers Filter</filter-name>
      <url-pattern>/p/*</url-pattern>
   </filter-mapping>

   <filter-mapping>
      <filter-name>Security Headers Filter</filter-name>
      <url-pattern>/proxy/*</url-pattern>
   </filter-mapping>

   <filter-mapping>
      <filter-name>Security Headers Filter</filter-name>
      <url-pattern>/service/*</url-pattern>
   </filter-mapping>

   <filter-mapping>
      <filter-name>UrlRewriteFilter</filter-name>
      <url-pattern>/proxy/*</url-pattern>
   </filter-mapping>
   
   <filter-mapping>
      <filter-name>UrlRewriteFilter</filter-name>
      <url-pattern>/service/*</url-pattern>
   </filter-mapping>
   
   <filter-mapping>
      <filter-name>UrlRewriteFilter</filter-name>
      <url-pattern>/feedservice/*</url-pattern>
   </filter-mapping>
   
   <filter-mapping>
      <filter-name>UrlRewriteFilter</filter-name>
      <url-pattern>/res/*</url-pattern>
   </filter-mapping>
   
   <filter-mapping>
      <filter-name>UrlRewriteFilter</filter-name>
      <url-pattern>/system/*</url-pattern>
   </filter-mapping>
   
   <filter-mapping>
      <filter-name>UrlRewriteFilter</filter-name>
      <url-pattern>/s/*</url-pattern>
   </filter-mapping>

   <filter-mapping>
      <filter-name>UrlRewriteFilter</filter-name>
      <url-pattern>/noauth/*</url-pattern>
   </filter-mapping>

   <!-- Spring Context Loader listener - the name of the default global context is passed to the DispatcherServlet
        in the servlet definition below - this is to allow the NTLM filter etc. to find the single app context -->
   <listener>
      <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
   </listener>
   
   <servlet>
      <servlet-name>Spring Surf Dispatcher Servlet</servlet-name>
      <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
      <init-param>
         <param-name>contextAttribute</param-name>
         <param-value>org.springframework.web.context.WebApplicationContext.ROOT</param-value>
      </init-param>
      <init-param>
         <param-name>dispatchOptionsRequest</param-name>
         <param-value>true</param-value>
      </init-param>
      <load-on-startup>1</load-on-startup>
   </servlet>
   
   <servlet-mapping>
      <servlet-name>Spring Surf Dispatcher Servlet</servlet-name>
      <url-pattern>/page/*</url-pattern>
   </servlet-mapping>
   <servlet-mapping>
      <servlet-name>Spring Surf Dispatcher Servlet</servlet-name>
      <url-pattern>/p/*</url-pattern>
   </servlet-mapping>
   
   <session-config>
      <session-timeout>60</session-timeout>
   </session-config>

   <!-- welcome file list precedence order is index.jsp -->
   <welcome-file-list>
      <welcome-file>index.jsp</welcome-file>
   </welcome-file-list>
   
   <error-page> 
      <error-code>500</error-code> 
      <location>/error500.jsp</location> 
   </error-page>

</web-app>
