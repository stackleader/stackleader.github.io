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

#### Run the Quickstart

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

#### How it Works

The focus of this post is on the RouteBuilder for the REST service.  Please see our other posts on the basics of 
Apache Camel, Declarative services, and OSGi.

The RouteBuilder class [ServiceRB.java](https://github.com/stackleader/camel-quickstarts/blob/master/rest/com.stackleader.camel.quickstart.rest/src/main/java/com/stackleader/camel/quickstart/rest/service/ServiceRB.java) defines the configuration and routing 
for the REST endpoint.  First the REST dsl with Camel is used to setup an endpoint use the jetty9 camel component.  It also
configures the endpoint to bind to port 8181 and that it should automatically unmarshal and marshal to JSON.  When a 
binding mode is specified, it will automatically search for an implementation of that mode on the classpath.  In this case, 
Jackson is already on the classpath by loading the camel-jackson feature which contains the JSON Jackson data format.

The rest dsl defines a path `/orders` that it will expect POST requests.  The type call defines that it should umarshal the 
body of the JSON payload to an [Order](https://github.com/stackleader/camel-quickstarts/blob/master/rest/com.stackleader.camel.quickstart.rest/src/main/java/com/stackleader/camel/quickstart/rest/model/Order.java) object.  Lastly, specification of a `.to()` states
that this endpoint will start it's routing on the endpoint ORDERS_ENDPOINT.  ORDERS_ENDPOINT is a string (direct:orders) specifying that 
the route will start from a direct endpoint called orders.  The direct component enables in memory, synchronise routing.

{% highlight text %}
restConfiguration().component("jetty").host("0.0.0.0").port("8181").bindingMode(RestBindingMode.json);
rest("/orders").post().type(Order.class).to(ORDERS_ENDPOINT);
{% endhighlight %}

Next, the routing logic defines that it will listen for messages on the direct orders endpoint.  The previous configuration
took care of wiring the direct orders endpoint to requests on the `/orders` path.

The next step in the route is a call to log.  For every request on the `/orders` path and subsequent activation of this 
route, the message "Processing order" will print to the karaf logs with the defined logging level.

The last step is a call to `.to()` using the bean component.  Services that are registered in the OSGi registry are available
using the bean component.  The method parameter defines which method to call on that service.  Any call to `.to()` in
Camel will send the current Exchange to the component and the component can potentially return different state in the exchange.
 In this case, the return value of the processOrders method will be set to the body of the exchange.  Since this is the end
 of the route, the current body of the exchange is set to the response for the http post call.

{% highlight text %}
from(ORDERS_ENDPOINT)
        .log(LoggingLevel.INFO, "Processing order")
        .to("bean:" + OrderProcessor.class.getCanonicalName() + "?method=processOrder");
{% endhighlight %}