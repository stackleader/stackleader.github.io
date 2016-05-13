---
layout: post
title:  "Deploy Apache Camel REST Quickstart on Karaf"
description: "This post describes how to deploy an Apache Camel REST quickstart on Karaf."
imageSmall: /img/blog/camel_karaf_small.png
imageLarge: /img/blog/camel_karaf_large.png
date:   2016-05-02 12:00:00 -0400
categories: camel
tags: [osgi,camel]
---

This blog post will utilize the Karaf Docker container created in a previous post.

<https://blog.stackleader.com/docker/2016/05/02/running-karaf-docker-container.html>

The source code for this blog post is located at:

<https://github.com/stackleader/camel-quickstarts>

Clone the project locally and build the project with Maven.

{% highlight text %}
 git clone https://github.com/stackleader/camel-quickstarts
 cd camel-quickstarts
 mvn clean install
{% endhighlight %}

Start the Karaf container in shell mode.

{% highlight text %}
docker run -it -p 5005:5005 -p 8181:8181 -v ~/.m2:/opt/karaf/.m2 stackleader/karaf shell
{% endhighlight %}

Add the feature repository in the karaf shell which contains the camel quickstart features.  You must compile 
the quickstart project for this step to work.

{% highlight text %}
feature:repo-add mvn:com.stackleader/com.stackleader.camel.quickstart.feature/1.0.0/xml/features
{% endhighlight %}

Now install the camel-quickstart-rest feature

{% highlight text %}
feature:install camel-quickstart-rest 
{% endhighlight %}

Tail the karaf logs.  You should see no errors

{% highlight text %}
log:tail
{% endhighlight %}

Test the deployed rest endpoint.  Run this curl command from the root of the rest project directory

{% highlight text %}
cd rest/com.stackleader.camel.quickstart.rest
curl -XPOST --header 'Content-Type: application/json' --data @data/input.json http://localhost:8181/orders
{% endhighlight %}

The response should look as follows:

{% highlight text %}
{
    "id":1,
    "orderId":1,
    "lastFourCC":1111,
    "lineItems":[{
        "id":1,
        "name":"pencils",
        "quantity":4,
        "price":0.99
    }],
    "total":3.96
}
{% endhighlight %}