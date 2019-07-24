if [ -z $1 ]
then
    echo "Must specify a destination"
    exit 1
fi

if [ -z $2 ]
then
    echo "Must specify a version"
    exit 1
fi

VERSION=$2
scp -pr ../target/modules $1:~

mkdir -p jars/platform
mkdir -p jars/share

for i in cggh-alfresco-util-${VERSION}.jar org_cggh_module_cms-${VERSION}.jar discussions-platform-jar-0.0.5.jar discussions-email-0.0.5.jar contentreich-eml-repo-1.0-SNAPSHOT.jar auth-platform-jar-${VERSION}.jar itext-2.1.7.jar aspectjrt-1.8.7.jar
do
    cp ../target/platform-war/WEB-INF/lib/$i jars/platform
done

for i in share-patch-module-${VERSION}.jar dojoCMIS-0.0.2.jar discussions-share-jar-0.0.5.jar cggh-alfresco-extensions-share-jar-${VERSION}.jar auth-share-jar-${VERSION}.jar contentreich-eml-share-1.0-SNAPSHOT.jar
do
    cp ../target/share-war/WEB-INF/lib/$i jars/share
done

scp -pr jars $1:~
scp -pr config $1:~

scp -pr *.sh $1:~

