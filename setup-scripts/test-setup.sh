sudo apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"
sudo apt update
sudo apt install docker-ce
sudo usermod -aG docker ${USER}

echo "See README for running test ldap"

docker run  --detach -p 8125:8025 -p 1025:1025 mailhog/mailhog:v1.0.0 -ui-web-path mailhog
