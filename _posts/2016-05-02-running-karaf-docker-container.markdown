---
layout: post
title:  "Running an Apache Karaf Docker Container"
description: "This post describes how to run an Apache Karaf Docker container."
imageSmall: /img/blog/karaf_docker_small.png
imageLarge: /img/blog/karaf_docker_large.png
date:   2016-05-02 10:57:33 -0400
categories: docker
tags: [docker,osgi]
---

Several of our tutorials will utilize the Apache Karaf OSGi container.  For convenience, we have made available an open source Docker container that will be used in the Karaf blog posts.

<https://github.com/stackleader/karaf-container>

<https://hub.docker.com/r/stackleader/karaf>

To get started, you will need to have the latest version of Docker installed.  We will not cover the installation here but please reference the Docker documentation.

<https://docs.docker.com/engine/installation>

{% highlight text %}
docker pull stackleader/karaf:latest
{% endhighlight %}

The container can be started in server mode and client/shell mode

####Server Mode####

With this mode, all logs will print to stdout for the container.  Type Ctrl-C to quit.

{% highlight text %}
docker run -it -p 5005:5005 -p 8181:8181 -v ~/.m2:/opt/karaf/.m2 stackleader/karaf
{% endhighlight %} 

####Shell Mode####

With this mode, the karaf shell will be available when the container starts.  Type Ctrl-D to quit.

{% highlight text %}
docker run -it -p 5005:5005 -p 8181:8181 -v ~/.m2:/opt/karaf/.m2 stackleader/karaf shell
{% endhighlight %} 

####Parameters####

| -it | Start the container in interactive mode so that Ctrl-C/D and the shell function properly |
| -p 5005:5005 | Bind the debug port 5005 to the host so that debugging is possible |
| -p 8181:8181 | Bind the Karaf http port to host |
| -v ~/.m2:/opt/karaf/.m2 | Make your maven repository accessible from the Karaf instance running in the container |