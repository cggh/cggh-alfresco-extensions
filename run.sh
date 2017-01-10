#!/bin/bash

#The javaagent option is roughly equivalent to:
#Copy org.springframework.instrument.tomcat.jar from ~/.m2/repository/... into $CATALINA_HOME/lib, where $CATALINA_HOME represents the root of the Tomcat installation)

#http://stackoverflow.com/questions/24657418/spring-core-3-2-9-java-8/27556298#27556298
MAVEN_OPTS="-Xms256m -Xmx2G -noverify -javaagent:${HOME}/.m2/repository/org/springframework/spring-instrument/3.2.14.RELEASE/spring-instrument-3.2.14.RELEASE.jar" mvn clean install -DskipTests=true -Plocal alfresco:run | tee stdout.log
