---
layout: post
title: Exploring kubernetes.
---

I haven't got time to work with k8s yet but always wanted to try it. But k8s is
a cluster orchestrator and I don't have many computers at home to build a
cluster. I've seen people making rack of raspberry pis with a proper networking
and all that but I don't have this luxury. 

* run
Start server on host thinkpad:
#+BEGIN_SRC shell
k3s server --token test \
    --disable metrics-server --disable traefik \
    --disable local-storage --disable servicelb \
    --flannel-backend=host-gw \
    --write-kubeconfig-mode 666

# don't deploy on this node
# can't use --disable-agent because routing is handled by it
kubectl cordon thinkpad
#+END_SRC

#+RESULTS:

Start node on host auto1:
#+BEGIN_SRC sh
k3s agent -s https://thinkpad:6443 -t test --data-dir=/home/sarg/k3s
#+END_SRC

Start test image:
#+BEGIN_SRC sh
kubectl run --image=kennethreitz/httpbin httpbin --port=80
kubectl expose deployment httpbin --port=80 --name=httpbin
#+END_SRC

Run dashboard:
https://rancher.com/docs/k3s/latest/en/installation/kube-dashboard/

#+BEGIN_SRC sh
kubectl -n kubernetes-dashboard describe secret admin-user-token | grep ^token
#+END_SRC

#+RESULTS:
: token:      eyJhbGciOiJSUzI1NiIsImtpZCI6InJjRE9yWU9PcmpPcGVrWmUwV0hPMW15cWxXSlpsSDBhXzJrRkc5Y204OGsifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlcm5ldGVzLWRhc2hib2FyZCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLW5rcW1xIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiI2ZDBiMzg5Zi05NGYzLTRjZGUtOTMwNy1kMjNlNzRjOWQxZDciLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZXJuZXRlcy1kYXNoYm9hcmQ6YWRtaW4tdXNlciJ9.CsK6gcyUaWN9GhqjopeahY0Eb14imN2tvqFUBr3qzgDAuLI49loiXoL9IPEJr7KzEYPlfVysIX0KAHRRDfJKroFln1AaHPnbz_tsS0B8IGhfRzx-Goal1EEO2PBizTyLCLse06Soh-GXY1_KraVezuJrOlaq7EYuWGeUVtdBt0F45A4emZK05Jbze7uwgDRblkWooaKY8nj4SighORznKRePQtUfhwksaFfDAHNJCTyDMuRxXME1EafS1ZjCA7MTzp1ZyJC0HILR0AgKacSVDrzI6SyfchNFMlhaITjximprJDMYtVJb-LU-d9AWc1sGMIdVJff8VKkjfvB15oYuWA
* Recalling
Kubernetes is a cluster resource scheduler. Cluster consists of nodes where pods
are running. Pod is made of containers. Minimal unit of management is pod.

Container - process running in isolated namespaces
Pod - set of containers (running on one node)
Node - server, part of a cluster. Should have agent running.
Controller - brain of the cluster

Node network topology:
cni0 - bridge, ip assigned by controller from $--cluster-cidr$
#+BEGIN_EXAMPLE
--cluster-cidr value (networking)
Network CIDR to use for pod IPs (default: "10.42.0.0/16")
#+END_EXAMPLE

Every container has it's own veth interface which is plugged into cni0.
IP addresses assigned by agent?

Node-to-node communication is handled by CNI (Cluster Networking Implementation)
One of the choices is Flannel which is based on VxLAN.
Excellent overview:
https://programmer.help/blogs/practice-vxlan-under-linux.html
* <2020-04-03 Fri>
To connect to k3s from diffent machine:
copy master:/etc/rancher/k3s.yaml to machine:~/.kube/config
then use kubectl (original, no k3s needed) as usual
