#!/bin/bash

MAVEN_OPTS="-Xms256m -Xmx2G -noverify -javaagent:${HOME}/.m2/repository/org/springframework/spring-instrument/3.2.14.RELEASE/spring-instrument-3.2.14.RELEASE.jar" mvnDebug clean install -DskipTests=true -Plocal alfresco:run
