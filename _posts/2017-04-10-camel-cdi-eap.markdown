---
layout: post
title:  "Getting started with camel-cdi on EAP 7"
description: "This post explains how to leverage camel-cdi on EAP 7"
imageSmall: /img/blog/camel_karaf_small.png
imageLarge: /img/blog/camel_karaf_large.png
date:   2017-04-11 10:18:00 -0400
categories: camel
tags: [osgi, camel]
---

## Overview
The Apache Camel CDI component was updated in 2.17 to integrate more seemlessly with CDI. This post shows an example of how to get started defining routes using the java dsl with the use of the camel-cdi component. 

### Source
The source code for this example is available on [github](https://github.com/stackleader/karaf-grpc){:target="_blank"}.

### pom.xml 
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.stackleader</groupId>

    <artifactId>camel-cdi-eap</artifactId>
    <version>1.0.0</version>
    <packaging>war</packaging>
    <name>EAP 7 Camel  :: example</name>
    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>1.8</maven.compiler.source>
        <maven.compiler.target>1.8</maven.compiler.target>
        <failOnMissingWebXml>false</failOnMissingWebXml>
        <slf4j.version>1.7.7</slf4j.version>
        <camel-version>2.18.3</camel-version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>javax</groupId>
            <artifactId>javaee-api</artifactId>
            <version>7.0</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
            <version>${slf4j.version}</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>org.apache.camel</groupId>
            <artifactId>camel-core</artifactId>
            <version>${camel-version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.camel</groupId>
            <artifactId>camel-cdi</artifactId>
            <version>${camel-version}</version>
        </dependency>
    </dependencies>

</project>
{% endhighlight %} 

### Defining a Camel Route
Create an application scoped class extending org.apache.camel.builder.RouteBuilder and use the camel-cdi org.apache.camel.cdi.ContextName annotation to provide the camel context reference.  


{% highlight java %}
package com.stackleader.camel.example;

import javax.ejb.Startup;
import javax.enterprise.context.ApplicationScoped;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.cdi.ContextName;

/**
 *
 * @author dcnorris
 */
@ApplicationScoped
@Startup
@ContextName("mycamelContext")
public class CamelRunner extends RouteBuilder {

    @Override
    public void configure() throws Exception {
        from("timer://foo?period=5000")
                .setBody()
                .simple("Camel")
                .log("Hello ${body}");
    }

}
{% endhighlight %} 

The above route will simply log the message "Hello Camel" every 5 seconds.

### Output

{% highlight bash %}
11:39:56,967 INFO  [org.jboss.weld.deployer] (MSC service thread 1-5) WFLYWELD0003: Processing weld deployment camel-cdi-eap-1.0.0.war
11:39:57,020 INFO  [org.hibernate.validator.internal.util.Version] (MSC service thread 1-5) HV000001: Hibernate Validator 5.2.4.Final-redhat-1
11:39:57,158 INFO  [org.jboss.weld.deployer] (MSC service thread 1-8) WFLYWELD0006: Starting Services for CDI deployment: camel-cdi-eap-1.0.0.war
11:39:57,183 INFO  [org.jboss.weld.Version] (MSC service thread 1-8) WELD-000900: 2.3.3 (redhat)
11:39:57,213 INFO  [org.jboss.weld.deployer] (MSC service thread 1-2) WFLYWELD0009: Starting weld service for deployment camel-cdi-eap-1.0.0.war
11:39:57,373 INFO  [org.jboss.weld.Event] (MSC service thread 1-3) WELD-000411: Observer method [BackedAnnotatedMethod] private org.apache.camel.cdi.CdiCamelExtension.processAnnotatedType(@Observes ProcessAnnotatedType<?>) receives events for all annotated types. Consider restricting events using @WithAnnotations or a generic type with bounds.
11:39:58,254 INFO  [org.apache.camel.cdi.CdiCamelExtension] (MSC service thread 1-3) Camel CDI is starting Camel context [mycamelContext]
11:39:58,255 INFO  [org.apache.camel.impl.DefaultCamelContext] (MSC service thread 1-3) Apache Camel 2.18.3 (CamelContext: mycamelContext) is starting
11:39:58,256 INFO  [org.apache.camel.management.ManagedManagementStrategy] (MSC service thread 1-3) JMX is enabled
11:39:58,335 INFO  [org.apache.camel.impl.converter.DefaultTypeConverter] (MSC service thread 1-3) Loaded 189 type converters
11:39:58,351 INFO  [org.apache.camel.impl.DefaultRuntimeEndpointRegistry] (MSC service thread 1-3) Runtime endpoint registry is in extended mode gathering usage statistics of all incoming and outgoing endpoints (cache limit: 1000)
11:39:58,423 INFO  [org.apache.camel.impl.DefaultCamelContext] (MSC service thread 1-3) StreamCaching is not in use. If using streams then its recommended to enable stream caching. See more details at http://camel.apache.org/stream-caching.html
11:39:58,442 INFO  [org.apache.camel.impl.DefaultCamelContext] (MSC service thread 1-3) Route: route1 started and consuming from: timer://foo?period=5000
11:39:58,444 INFO  [org.apache.camel.impl.DefaultCamelContext] (MSC service thread 1-3) Total 1 routes, of which 1 are started.
11:39:58,445 INFO  [org.apache.camel.impl.DefaultCamelContext] (MSC service thread 1-3) Apache Camel 2.18.3 (CamelContext: mycamelContext) started in 0.189 seconds
11:39:58,557 INFO  [org.wildfly.extension.undertow] (ServerService Thread Pool -- 60) WFLYUT0021: Registered web context: /camel-cdi-eap-1.0.0
11:39:58,578 INFO  [org.jboss.as.server] (ServerService Thread Pool -- 34) WFLYSRV0010: Deployed "camel-cdi-eap-1.0.0.war" (runtime-name : "camel-cdi-eap-1.0.0.war")
11:39:58,661 INFO  [org.jboss.as] (Controller Boot Thread) WFLYSRV0060: Http management interface listening on http://127.0.0.1:9990/management
11:39:58,661 INFO  [org.jboss.as] (Controller Boot Thread) WFLYSRV0051: Admin console listening on http://127.0.0.1:9990
11:39:58,662 INFO  [org.jboss.as] (Controller Boot Thread) WFLYSRV0025: JBoss EAP 7.0.0.GA (WildFly Core 2.1.2.Final-redhat-1) started in 4474ms - Started 360 of 649 services (382 services are lazy, passive or on-demand)
11:39:59,475 INFO  [route1] (Camel (mycamelContext) thread #0 - timer://foo) Hello Camel
11:40:04,448 INFO  [route1] (Camel (mycamelContext) thread #0 - timer://foo) Hello Camel
{% endhighlight %} 