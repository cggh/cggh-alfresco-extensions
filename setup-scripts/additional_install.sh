#!/bin/bash

if [ ${UID} -ne 0 ]
then
    echo "Must be run as root"
    exit 1
fi

IP=$(curl http://169.254.169.254/2009-04-04/meta-data/public-ipv4)
INTERNAL_IP=$(curl http://169.254.169.254/latest/meta-data/local-ipv4)
NAME=alfresco52.malariagen.net
DNS_IP=$(dig +short ${NAME})
REPO=alfresco52.malariagen.net
REPO_IP=172.10.181.127
DNS_IP_REPO=$(dig +short ${REPO})
SHARE=alfresco52.malariagen.net
DNS_IP_SHARE=$(dig +short ${SHARE})
SOLR=172.10.122.198
DNS_IP_SOLR=$(dig +short ${SOLR})

if [ ${DNS_IP} != ${IP} ]
then
	echo "IPs don't match please check!"
	exit 1
fi

cp config/platform/etc/java-cas-client.properties /etc
sed -i -e "s#\(serverName=\).*#\1${NAME}#" /etc/java-cas-client.properties

export ALF_HOME=/opt/alfresco

${ALF_HOME}/alfresco-service.sh stop

if [ ${REPO} = 'localhost' -o ${REPO} = ${INTERNAL_IP} -o ${IP} = ${DNS_IP_REPO} ]
then
	for i in addons/apply.sh alfresco-service.sh scripts/libreoffice.sh
	do
		sed -i -e 's#JAVA_HOME="/usr/lib/jvm/java-8-oracle"#JAVA_HOME="/usr/lib/jvm/java-8-openjdk-amd64"#' ${ALF_HOME}/${i}
		sed -i -e 's#JAVA_HOME=/usr/lib/jvm/java-8-oracle#JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64#' ${ALF_HOME}/${i}
	done

	#Repo
	apt-get install imagemagick ghostscript libgs-dev libjpeg62 libpng16-16 libdbus-glib-1-2
	for i in alfresco-share-services alfresco-googledocs-repo alfresco-aos-module
	do
		rm modules/platform/amps/${i}*
	done
	if [ ! -f config_params ]
	then
		echo "You must create a config_params file"
		exit 1
	fi
	cp --backup config/platform/var/lib/tomcat/shared/classes/alfresco-global.properties /opt/alfresco/tomcat/shared/classes/
	set -o allexport
	source config_params
	set +o allexport
	sed -i.bak -e "s#\(solr.host=\).*#\1${SOLR}#" \
		-e "s#\(db.username=\).*#\1${MYSQL_USER}#" \
		-e "s#\(db.password=\).*#\1${MYSQL_PASSWORD}#" \
		-e "s#\(db.name=\).*#\1${MYSQL_DATABASE}#" \
		-e "s#\(db.host=\).*#\1${MYSQL_HOST}#" \
		-e "s#\(alfresco.host=\).*#\1${REPO}#" \
		-e "s#\(share.host=\).*#\1${SHARE}#" \
		-e "s#\(mail.port=\).*#\1${MAIL_PORT}#" \
		-e "s#\(mail.host=\).*#\1${MAIL_HOST}#" \
		-e "s#\(ldap.authentication.java.naming.provider.url=\).*#\1${LDAP_SERVER}#" \
		-e "s#\(ldap.authentication.java.naming.security.principal=\).*#\1${LDAP_USER}#" \
		-e "s#\(ldap.authentication.java.naming.security.credentials=\).*#\1${LDAP_PASSWORD}#" \
		/opt/alfresco/tomcat/shared/classes/alfresco-global.properties
	cp modules/platform/amps/* ${ALF_HOME}/addons/alfresco
	${ALF_HOME}/addons/apply.sh all

	${ALF_HOME}/alfresco-service.sh stop
	sed -i.bak -e 's/-Xmx2G/-Xmx6G/' ${ALF_HOME}/alfresco-service.sh
	${ALF_HOME}/alfresco-service.sh start
	${ALF_HOME}/scripts/libreoffice.sh start
	cp jars/platform/* /opt/alfresco/tomcat/webapps/alfresco/WEB-INF/lib/
    #Set up forwarding via SES
    postconf -e smtp_tls_CAfile = /etc/ssl/certs/ca-certificates.crt
    postconf -e smtp_tls_note_starttls_offer = yes
    postconf -e smtp_tls_security_level = encrypt
    postconf -e smtp_use_tls = yes
    postconf -e relayhost = email-smtp.us-east-1.amazonaws.com
    postconf -e smtp_sasl_auth_enable = yes
    postconf -e smtp_sasl_security_options = noanonymous
    postconf -e smtp_sasl_password_maps = hash:/etc/postfix/sasl_password
    postconf -e smtp_tls_policy_maps = hash:/etc/postfix/tls_policy
    grep amazonaws /etc/postfix/tls_policy || echo "email-smtp.us-east-1.amazonaws.com	secure" >> /etc/postfix/tls_policy
    postmap /etc/postfix/tls_policy

    postconf -e virtual_maps=hash:/etc/postfix/virtual
    grep root /etc/postfix/virtual || echo "root sysadmin@malariagen.net" >> /etc/postfix/virtual
    grep alfresco /etc/postfix/virtual || echo "alfresco sysadmin@malariagen.net" >> /etc/postfix/virtual
    postmap /etc/postfix/virtual

    postfix reload
fi

if [ ${SOLR} = 'localhost' -o "${DNS_IP_SOLR}" = ${INTERNAL_IP} -o ${SOLR} = ${INTERNAL_IP} -o ${SOLR} = ${IP} ]
then
	echo "Solr install"
	sed -i.bak -e "s#\(SOLR_ALFRESCO_HOST=\).*#\1${REPO_IP}#" /opt/alfresco/solr6/solr.in.sh
	sed -i.bak -e "s#\(alfresco.host=\).*#\1${REPO_IP}#" /opt/alfresco/alf_data/solr6/solrhome/alfresco/conf/solrcore.properties /opt/alfresco/alf_data/solr6/solrhome/archive/conf/solrcore.properties
	cp --backup /opt/alfresco/solr6/logs/log4j.properties /opt/alfresco/logs/solr6/log4j.properties
	systemctl start alfresco-search.service
fi

if [ ${DNS_IP} = ${DNS_IP_SHARE} ]
then
	#Share config
	for i in alfresco-googledocs-share
	do
		rm modules/share/amps/${i}*
	done
	cp modules/share/amps/* ${ALF_HOME}/addons/share
	${ALF_HOME}/alfresco-service.sh stop
	sed -i.bak -e 's/-Xmx2G/-Xmx6G/' ${ALF_HOME}/alfresco-service.sh
	${ALF_HOME}/addons/apply.sh all
	${ALF_HOME}/alfresco-service.sh start

	cp jars/share/* /opt/alfresco/tomcat/webapps/share/WEB-INF/lib/


	apt install apache2 libapache2-mod-jk
	cp config/share/etc/ssl/private/malariagen.net.key /etc/ssl/private/malariagen.net.key
	chown root:ssl-cert /etc/ssl/private/malariagen.net.key
	chmod 640 /etc/ssl/private/malariagen.net.key
	cp config/share/etc/ssl/certs/* /etc/ssl/certs

	usermod -a -G ssl-cert www-data
	usermod -a -G ssl-cert postfix
    postconf -e smtpd_tls_cert_file=/etc/ssl/certs/malariagen-2017.crt
    postconf -e smtpd_tls_CAfile=/etc/ssl/certs/IntermediateCA.crt
    postconf -e smtpd_tls_key_file=/etc/ssl/private/malariagen.net.key
    postconf -e smtpd_tls_protocols=!SSLv2,!SSLv3
    postconf -e smtpd_tls_ciphers=high
    postconf -e smtpd_use_tls=yes
    postconf -e "smtpd_relay_restrictions=permit_sasl_authenticated,permit_mynetworks,reject_unauth_destination,reject_rbl_client sbl.spamhaus.org,reject_unauth_destination,reject_invalid_helo_hostname,reject_unknown_recipient_domain"

    postconf -e local_recipient_maps=
    postconf -e local_transport=error: local mail delivery is disabled

    postconf -e smtp_tls_policy_maps = hash:/etc/postfix/tls_policy
    egrep ^localhost /etc/postfix/tls_policy || echo "localhost	none" >> /etc/postfix/tls_policy
    grep 8025 /etc/postfix/tls_policy || echo "[localhost]:8025	none" >> /etc/postfix/tls_policy
    postmap /etc/postfix/tls_policy

    postconf -e virtual_maps=hash:/etc/postfix/virtual
    grep root /etc/postfix/virtual || echo "root sysadmin@malariagen.net" >> /etc/postfix/virtual
    grep alfresco /etc/postfix/virtual || echo "alfresco sysadmin@malariagen.net" >> /etc/postfix/virtual
    postmap /etc/postfix/virtual


	cp config/share/etc/apache2/sites-available/* /etc/apache2/sites-available
	sed -i -e "s/\(ServerName\s*\).*/\1${NAME}/" -e "s#\(Redirect permanent /share https://\)[^/]*#\1${NAME}#" /etc/apache2/sites-available/alfresco.conf
	a2enmod rewrite
	a2enmod ssl
	a2enmod headers
	a2enmod proxy_http
	a2ensite alfresco

	cp config/share/var/lib/tomcat/shared/classes/share-global.properties /opt/alfresco/tomcat/shared/classes/
	cp --backup /opt/alfresco/tomcat/shared/classes/alfresco/web-extension/share-config-custom.xml /opt/alfresco/tomcat/shared/classes/alfresco/web-extension/share-config-custom.xml.orig
	cp config/share/var/lib/tomcat/shared/classes/alfresco/web-extension/share-config-custom.xml /opt/alfresco/tomcat/shared/classes/alfresco/web-extension/share-config-custom.xml
	sed -i -e "s#\(<endpoint-url>http://\)[^:]*#\1${REPO_IP}#" /opt/alfresco/tomcat/shared/classes/alfresco/web-extension/share-config-custom.xml

	cp --backup /opt/alfresco/tomcat/conf/server.xml /opt/alfresco/tomcat/conf/server.xml.orig
	cp config/share/etc/tomcat/server.xml /opt/alfresco/tomcat/conf/server.xml


	cp --backup /etc/libapache2-mod-jk/workers.properties /etc/libapache2-mod-jk/workers.properties.orig
	cp config/share/etc/libapache2-mod-jk/workers.properties /etc/libapache2-mod-jk/workers.properties
	sed -i -e "s/\(worker.alfresco-worker.host=\).*/\1${REPO_IP}/" /etc/libapache2-mod-jk/workers.properties

    cp --backup config/share/etc/postfix/transport /etc/postfix/transport
    sed -i -e "s/\[.[^]]*/\[${REPO}/" /etc/postfix/transport
    postmap /etc/postfix/transport
    postconf -e transport_maps=hash:/etc/postfix/transport
    postfix reload
fi

${ALF_HOME}/alfresco-service.sh restart
