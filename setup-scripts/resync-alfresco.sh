set -x
REMOTE_HOST=alfresco.malariagen.net
LOCAL_SETTINGS=`egrep '^(dir.root|db)' /var/lib/tomcat7/shared/classes/alfresco-global.properties`
REMOTE_SETTINGS=`ssh ${REMOTE_HOST} -t "egrep '^(dir.root|db)' /var/lib/tomcat7/shared/classes/alfresco-global.properties"`

declare -A local_settings=()
declare -A remote_settings=()
for i in username password name dir.root url
do
	local_settings[${i}]=$(echo "${LOCAL_SETTINGS}"|grep ${i}| awk -F= '{print $2}'| tail -1 | tr -d "\r")
	remote_settings[${i}]=$(echo "${REMOTE_SETTINGS}"|grep ${i}| awk -F= '{print $2}'| tail -1 | tr -d "\r")
done

if [ ${local_settings["url"]} == ${remote_settings["url"]} ]
then
	echo "Local and remote url are the same!"
	exit 1
fi
local_settings["dbhost"]=`echo -n "${local_settings['url']}" | awk -F/ '{print $3}'`  
remote_settings["dbhost"]=`echo -n "${remote_settings['url']}" | awk -F/ '{print $3}'`  
echo ${local_settings["dbhost"]}
echo ${remote_settings["dbhost"]}

echo ${local_settings["name"]}
echo ${remote_settings["name"]}

echo ${local_settings["username"]}
echo ${remote_settings["username"]}

echo ${local_settings["dir.root"]}
echo ${remote_settings["dir.root"]}


DUMPFILE=${remote_settings["dbhost"]}-${remote_settings["name"]}-`date +"%Y-%m-%d-%H:%M"`.sql.gz
mysqldump -u ${remote_settings["username"]} -p${remote_settings["password"]} ${remote_settings["name"]} -h ${remote_settings["dbhost"]} |gzip -c > ${DUMPFILE}
LOCAL_DUMPFILE=${local_settings["dbhost"]}-${local_settings["name"]}-`date +"%Y-%m-%d-%H:%M"`.sql.gz
mysqldump -u ${local_settings["username"]} -p${local_settings["password"]} ${local_settings["name"]} -h ${local_settings["dbhost"]} |gzip -c > ${LOCAL_DUMPFILE}

echo "DROP DATABASE ${local_settings["name"]};" | mysql -h ${local_settings["dbhost"]}  -u ${local_settings["username"]} -p${local_settings["password"]} ${local_settings["name"]} 
echo "CREATE SCHEMA ${local_settings["name"]};" | mysql -h ${local_settings["dbhost"]} -u ${local_settings["username"]} -p${local_settings["password"]} 
service tomcat7 stop
zcat ${DUMPFILE} | mysql -h ${local_settings["dbhost"]} -u ${local_settings["username"]} -p${local_settings["password"]} ${local_settings["name"]} 

echo ${REMOTE_HOST}:${remote_settings["dir.root"]}/contentstore/ ${local_settings["dir.root"]}/contentstore/
rsync -av --delete ${REMOTE_HOST}:${remote_settings["dir.root"]}/contentstore/ ${local_settings["dir.root"]}/contentstore/
echo ${REMOTE_HOST}:${remote_settings["dir.root"]}/contentstore.deleted/ ${local_settings["dir.root"]}/contentstore.deleted/
rsync -av --delete ${REMOTE_HOST}:${remote_settings["dir.root"]}/contentstore.deleted/ ${local_settings["dir.root"]}/contentstore.deleted/
