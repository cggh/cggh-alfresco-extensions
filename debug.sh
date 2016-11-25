#!/bin/bash

MAVEN_OPTS="-Xms256m -Xmx2G" mvnDebug clean install -DskipTests=true -Plocal alfresco:run
