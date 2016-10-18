#!/bin/bash

if [ ! -f /etc/tomcat/fastersecurerandom.properties ]
then
    sudo echo 'securerandom.source=file:/dev/urandom' > /etc/tomcat/fastersecurerandom.properties 
fi
JAVA_OPTS="-Djava.security.properties=/etc/tomcat/fastersecurerandom.properties" MAVEN_OPTS="-Xms256m -Xmx2G" mvn clean install -DskipTests=true alfresco:run
