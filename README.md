1. Install kops and kubectl
curl -Lo kops https://github.com/kubernetes/kops/releases/download/$(curl -s https://api.github.com/repos/kubernetes/kops/releases/latest | grep tag_name | cut -d '"' -f 4)/kops-linux-amd64
chmod +x ./kops
mv ./kops /usr/bin/


curl -Lo kubectl https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
chmod +x ./kubectl
mv ./kubectl /usr/bin/kubectl
2. Install awscli
pip install awscli

3. Prepare s3busket
export REGION=us-west-2

aws s3api create-bucket --bucket pter-k8s --region ${REGION}
aws s3api put-bucket-versioning --bucket pter-k8s --versioning-configuration Status=Enabled
aws s3api put-bucket-encryption --bucket pter-k8s --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

4.Create cluster(before we need to create DNS zone)
export REGION=us-west-2
export KOPS_STATE_STORE=s3://pter-k8s
export NAME=pter2019.com


kops create cluster --dns-zone=pter2019.com --zones us-west-2a,us-west-2b --topology private --networking calico --master-size t2.micro --master-count 3 --node-size t2.large ${NAME}

5. Create secret
kops create secret --name pter2019.com sshpublickey admin -i ~/.ssh/id_rsa.pub

6. Creating a instance group of mixed instances types
kops create ig nodes-spot --role node --subnet us-west-2a,us-west-2b --name ${NAME}

7. Checking configs
kops edit cluster ${NAME}
kops edit ig --name=${NAME} master-us-west-2a-1
kops edit ig --name=${NAME} master-us-west-2a-2
kops edit ig --name=${NAME} master-us-west-2b-1
Here we can install min and max instances quantity

8. Applying changes
kops update cluster ${NAME} --yes 
9. Deploy application
kubectl apply -f ...
10. If we will use helm we can install application from helm chart