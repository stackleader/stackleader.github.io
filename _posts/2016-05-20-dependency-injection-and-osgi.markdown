---
layout: post
title:  "Dependency Injection for Declarative Services in OSGi Part 1"
description: "This post introduces dependency injection in the context of the OSGi Declarative Services Specification."
imageSmall: /img/blog/osgi_dependency_injection.png
imageLarge: /img/blog/osgi_dependency_injection_large.png
date:   2016-05-20 10:24:00 -0400
categories: osgi
tags: [osgi, dependency_injection]
---

With project Jigsaw and Java 9 coming soon (~March 2017), modular software has become a hot topic of discussion at conferences and meetups. 
For us fans of OSGi, project Jigsaw is simultaneously exciting and disappointing. It's exciting to see the community focusing on and discussing the many benefits of modularity, but it's also disappointing to see that project Jigsaw will for now largely fail to meet the needs of application developers who wish to build robust modular software systems (more on this in a future blog perhaps). The good news of course is that java developers already have access to a robust and mature framework for developing modular software systems, OSGi. In this post, I'd like to introduce the Apache Felix Service Component Runtime (SCR) implementation of the OSGi Declarative Services Specification, and how it can be used as a powerful dependency injection container to facilitate and enforce many OOP (Object Oriented Programming) best practices.

#### What is Dependency Injection?
Dependency injection is a form of [\"inversion of control\"](https://en.wikipedia.org/wiki/Inversion_of_control) where instead of an object being passed all of its dependencies through a **manual** call to its constructor, or through building or manually locating them,they are provided (i.e. injected) to the object by a container. Many injection containers emphasize or enforce "constructor injection", but its the container that takes on the responsibility for instantiating the object with the references to its dependencies. The idea of a container managing the lifecycle of objects is something that can take some getting use to if you are new to the world of dependency injection; however, once it is understood that objects that will undergo dependency injection are objects that are "managed" by a container, it should be easier to get your head around the concept.

#### Benefits of Dependency Injection Containers
There are many significant benefits to using a dependency injection container, but I will only cover this briefly since the topic has been covered well elsewhere (e.g. [here](https://www.youtube.com/watch?v=8RGhT-YySDY),). 
<div class="normal-list-style">
    <ul>
        <li>Reduces boilerplate (e.g. factories, singletons)</li>
        <li>Simplifies use of abstractions</li>
        <li>Dependency graph is explicit, making it easier to avoid dependency cycles (very common in when static object references are easy to reference… i.e. singleton pattern)</li>
        <li>Testing is simplified
            <ul>
                <li>Dependencies are explicit</li>
                <li>Dependencies are easier to mock</li>
            </ul>
        </li>
        <li>Modularity easier to achieve
            <ul>
                <li>Encourages single responsibility principle</li>
            </ul>
        </li>
    </ul>
</div>

#### What is the Apache Felix Service Component Runtime?
The Apache Felix Service Component Runtime (SCR) is an implementation of the OSGi Declarative Services specification, a specification designed with the expressed purpose of simplifying the creation and consumption of OSGi services. To unpack this a bit more, it's important to understand that in OSGi, "services" and not objects are intended to be the design primitives. An OSGi service is a java object implementing one or more interfaces that is placed (i.e. "registered") into the service registry. Services in the service registry are expected to be consumed through their abstractions (i.e. their interfaces), allowing implementation details to be hidden from service consumers. The design of the service registry coupled with the bundle classloading architecture in OSGi allows for the enforcement of interface-based programming through the enforcement of the [dependency inversion principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle). 

In a typical scenario, OSGi bundles will export packages containing high level abstractions (e.g. interfaces), and leave implementation classes hidden. This allows developers to enforce good OOP design through runtime classloader boundaries. Working with the service registry has historically involved a fairly significant amount of boilerplate code and services dependencies have been resolved using the service locator pattern. The Felix SCR Declarative Services Implementation removes the ceremonial boilerplate from interacting with the service registry by introducing a dependency injection container that is designed for dealing with the dynamic nature of OSGi services. 

##### Getting started with SCR
We have established that SCR is a dependency injection container designed for OSGi services, but not yet discussed the basics of the container. SCR depends on "SCR Desriptor" XML files being packaged up with an OSGi bundle. These descriptor files contain the "declarative" information about what objects will be created, when they will be created, what their dependencies are, and what services they are providing to the container for injection elsewhere. Although the XML is very easy to understand, and would not be too difficult to maintain manually, there is no need to manually create or maintain these files because there are several annotation libraries that can be used at build time that will take care of the generation and upkeep of descriptor files.

#### Hello World Example
In this first example, we simply use annotations to instantiate a component (an object managed by SCR is referred to as a "component") and demonstrate the available life-cycle hooks. This example will make use of the felix maven-bundle-plugin to generate the bundle manifest and process our SCR annotations to generate the SCR descriptor files.
 

##### Completed Project Download
For reference, you can download the completed project from [here](https://drive.google.com/file/d/0Bz6zdXGc_G2PRktpVFZmN3ZGdUk/view?usp=sharing). For the source, you can checkout the code from [github](https://github.com/stackleader/).

###### Completed Project Contents
The completed example project contains the latest apache-felix distribution supplemented with the felix-scr runtime bundle, a few logging related bundles, and the custom OSGi bundle generated from our maven project.
![Completed Project Contents](/img/blog/scr_example_1.png)

##### Maven Project 

##### Overview
As you can see below, our maven project is ordinary. It contains a parent pom, and a single module for building our first OSGi bundle. This bundle contains only a single java class. The project contents our shown below and heavily annotated to explain the contents.
![Maven Project Contents](/img/blog/scr_example_2.png)

###### HelloScrWorld.java

{% highlight java %}
package com.stackleader.training.osgi.scr;

import aQute.bnd.annotation.component.Activate;
import aQute.bnd.annotation.component.Component;
import aQute.bnd.annotation.component.Deactivate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/*
 * This annotation declares the class as an SCR component and specifies
 * that it should be immediately activated once its dependencies have been
 * satisfied.
 */
@Component(immediate = true)
public class HelloScrWorld {

    private static final Logger LOG = LoggerFactory.getLogger(HelloScrWorld.class);

    public HelloScrWorld() {
        //The constructor will be called first by SCR
        LOG.info("constructor called");
    }

    /*
     * This annotation indicates to our annotation processor that this is the
     * method we would like to have called when our component is activated. In
     * this instance it was optional since SCR will default to calling a void
     * method named activate if it exist; however, if we had wanted to use a
     * non-default name, the annotation would be necessary.
     */
    @Activate
    public void activate() {
        /*
         * The Activate method will be called after any required dependencies
         * have been injected.
         *
         */
        LOG.info("component activated");
    }

    @Deactivate
    public void deactivate() {
        /*
         * The deactivate lifecycle hook will fire only when an activated
         * component component becomes disabled, the component configuration
         * becomes unsatisfied, or the component configuration is no longer
         * needed.
         *
         */
        LOG.info("component deactivated");
    }

}

{% endhighlight %} 

###### Parent pom.xml
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.stackleader</groupId>
    <artifactId>com.stackleader.training.osgi</artifactId>
    <version>0.0.1</version>
    <packaging>pom</packaging>
    
    <dependencyManagement>
        <dependencies>
            <!--This is the library we will use for our SCR annotations-->
            <dependency>
                <groupId>biz.aQute.bnd</groupId>
                <artifactId>bndlib</artifactId>
                <version>2.4.0</version>
                <scope>compile</scope>
            </dependency>
             <!--SLF4j is added as our logging api-->
            <dependency>
                <groupId>org.slf4j</groupId>
                <artifactId>slf4j-api</artifactId>
                <version>1.7.7</version>
                <scope>provided</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
    
    <build>
        <pluginManagement>
            <plugins>
                 <!--This maven plugin will be used to generate our OSGi manifest file. -->
                <plugin>
                    <groupId>org.apache.felix</groupId>
                    <artifactId>maven-bundle-plugin</artifactId>
                    <version>3.0.1</version>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>

    <modules>
        <module>com.stackleader.training.osgi.scr</module>
    </modules>
</project>


{% endhighlight %} 

###### Project pom.xml
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.stackleader</groupId>
    <artifactId>com.stackleader.training.osgi.scr</artifactId>
    <version>0.0.1</version>
    <!--    Note the non-standard packaging type of 'bundle'-->
    <packaging>bundle</packaging>
    
    <parent>
        <groupId>com.stackleader</groupId>
        <artifactId>com.stackleader.training.osgi</artifactId>
        <version>0.0.1</version>
        <relativePath>../pom.xml</relativePath>
    </parent>
   
    <dependencies>
        <dependency>
            <groupId>biz.aQute.bnd</groupId>
            <artifactId>bndlib</artifactId>
        </dependency>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.felix</groupId>
                <artifactId>maven-bundle-plugin</artifactId>
                <extensions>true</extensions>
                <configuration>
                    <instructions>
                        <!--This instruction tells the maven bundle plugin to process 
                         all SCR annotations and include the component declarations in 
                        our manfiest file. -->
                        <Service-Component>*</Service-Component>
                    </instructions>
                </configuration>
            </plugin>  
        </plugins>
    </build>
    
</project>
{% endhighlight %} 

###### Build output
An ordinary 'mvn install' command will produce the following jar file.
![Jar Contents](/img/blog/scr_example_3.png)

####### Generated Manifest File

{% highlight text %}
Manifest-Version: 1.0
Bnd-LastModified: 1464274144115
Build-Jdk: 1.8.0_74
Built-By: dcnorris
Bundle-ManifestVersion: 2
Bundle-Name: com.stackleader.training.osgi.scr
Bundle-SymbolicName: com.stackleader.training.osgi.scr
Bundle-Version: 0.0.1
Created-By: Apache Maven Bundle Plugin
Export-Package: com.stackleader.training.osgi.scr;version="0.0.1"
Import-Package: org.slf4j;version="[1.7,2)"
Require-Capability: osgi.ee;filter:="(&(osgi.ee=JavaSE)(version=1.5))"
Service-Component: OSGI-INF/com.stackleader.training.osgi.scr.HelloScrWo
 rld.xml
Tool: Bnd-3.0.0.201509101326

{% endhighlight %} 

####### Generated SCR Descriptor (com.stackleader.training.osgi.scr.HelloScrWorld.xml)

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<scr:component xmlns:scr="http://www.osgi.org/xmlns/scr/v1.1.0" 
  name="com.stackleader.training.osgi.scr.HelloScrWorld" 
  immediate="true" 
  activate="activate" 
  deactivate="deactivate">
  <implementation class="com.stackleader.training.osgi.scr.HelloScrWorld"/>
</scr:component>
{% endhighlight %} 


#### Running the Project
After downloading the completed project ([link](https://drive.google.com/file/d/0Bz6zdXGc_G2PRktpVFZmN3ZGdUk/view?usp=sharing)), you can run the project.
 
 1. Navigate to the download location and explode the compressed artifact. 
 2. Move into the root of the exploded artifact (i.e. the felix-framework-5.4.0 directory)
 3. Run the felix.jar file from the context of the root directory
 {: .normal-list-style}
Example)
{% highlight bash %}
cd ~/Downloads
tar xzvf stackleader-hello-scr-world.tar.gz
cd felix-framework-5.4.0
java -jar bin/felix.jar
{% endhighlight %} 

This should launch the gogo shell. Also, you should see the logging output from the SCR container initalizing and activating our component.

Exmaple Output:
{% highlight text %}
11:19:38.487 [FelixStartLevel] INFO  c.s.training.osgi.scr.HelloScrWorld - constructor called
11:19:38.490 [FelixStartLevel] INFO  c.s.training.osgi.scr.HelloScrWorld - component activated
{% endhighlight %} 

To see the final disable lifecycle hook fire, we need to disable our component. To do this,

 1. Run the scr:list command to see a listing of the SCR components.
 2. Run the 'scr:disable com.stackleader.training.osgi.scr.HelloScrWorld' command to disable our component
 {: .normal-list-style}
Note the logging output from our disable method is displayed.

Example Output:
{% highlight text %}
11:20:09.639 [SCR Component Actor] INFO  c.s.training.osgi.scr.HelloScrWorld - component deactivated
{% endhighlight %} 

Full Example Shell)
![Project Run Summary](/img/blog/scr_example_4.png)

### Coming Soon
In part 2, we will cover creating and consuming services with SCR.