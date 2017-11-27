---
layout: post
title:  "Getting started with OpenShift Origin"
description: "This post explains how to setup a simple OpenShift cluster"
imageSmall: /img/blog/ocp_blog_small.png
imageLarge: /img/blog/ocp_blog_large.png
date:   2017-04-11 10:18:00 -0400
categories: openshift
tags: [openshift, kubernetes]
---

## Overview
The OpenShift cli contains a convenient utility for testing an OpenShift cluster.  This guide will demonstrate how to
setup a single node cluster and execute a few commands.

## Fedora/Centos/RHEL CLI Installation
Install the following packages
{% highlight bash %}
sudo dnf install -y origin-clients docker
{% endhighlight %}

## Alternative CLI Installation
Download oc cli client and install docker
{% highlight bash %}
wget https://github.com/openshift/origin/releases/download/v3.6.0/openshift-origin-client-tools-v3.6.0-c4dd4cf-linux-64bit.tar.gz
tar xvf openshift-origin-client-tools-v3.6.0-c4dd4cf-linux-64bit.tar.gz
sudo cp openshift-origin-client-tools-v3.6.0-c4dd4cf-linux-64bit/oc /usr/bin/
sudo chmod +x /usr/bin/oc
sudo dnf install -y docker
{% endhighlight %}

## Remaining Steps

Add your user to the docker group

{% highlight bash %}
sudo groupadd docker
sudo usermod -a -G docker <user name>
{% endhighlight %}

Open a new shell.  Add an insecure registry ```172.30.0.0/16``` to docker in the file ```/etc/containers/registries.conf```
{% highlight yaml %}
# lists of registries.

# The default location for this configuration file is /etc/containers/registries.conf.

# The only valid categories are: 'registries.search', 'registries.insecure',
# and 'registries.block'.

[registries.search]
registries = ['docker.io', 'registry.fedoraproject.org', 'registry.access.redhat.com']

# If you need to access insecure registries, add the registry's fully-qualified name.
# An insecure registry is one that does not have a valid SSL certificate or only does HTTP.
[registries.insecure]
registries = ['172.30.0.0/16']


# If you need to block pull access from a registry, uncomment the section below
# and add the registries fully-qualified name.
#
# Docker only
[registries.block]
registries = []
{% endhighlight %}

Start Docker

{% highlight bash %}
sudo systemctl start docker
{% endhighlight %}

Start OpenShift
{% highlight bash %}
$ oc cluster up
Starting OpenShift using openshift/origin:v3.6.0 ...
OpenShift server started.

The server is accessible via web console at:
    https://127.0.0.1:8443

You are logged in as:
    User:     developer
    Password: <any value>

To login as administrator:
    oc login -u system:admin
{% endhighlight %}

Login to the cluster as an administrator
{% highlight bash %}
$ oc login -u system:admin
Logged into "https://127.0.0.1:8443" as "system:admin" using existing credentials.

You have access to the following projects and can switch between them with 'oc project <projectname>':

    default
    kube-public
    kube-system
  * myproject
    openshift
    openshift-infra

Using project "myproject".
{% endhighlight %}

Try running the busybox container in your project ```myproject```
{% highlight bash %}
$ oc run -i -t busybox --image=busybox --restart=Never echo "hello world"
hello world
{% endhighlight %}
