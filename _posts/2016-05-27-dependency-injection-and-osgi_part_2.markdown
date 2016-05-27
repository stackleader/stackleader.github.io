---
layout: post
title:  "Dependency Injection for Declarative Services in OSGi Part 2"
description: "This post covers the basics of creating and consuming services with SCR."
imageSmall: /img/blog/osgi_dependency_injection.png
imageLarge: /img/blog/osgi_dependency_injection_large.png
date:   2016-05-27 9:00:00 -0400
categories: osgi
tags: [osgi, dependency_injection]
---

### Creating and Consuming Services with SCR
[Part 1](/osgi/2016/05/20/dependency-injection-and-osgi.html) of this blog covers the basics of SCR, so it is best to start with this material if you are new to SCR or dependency injection. In the post we will cover creating SCR (Service Component Runtime) components that expose and consume OSGi services. Lets start with creating a bundle with a component that exposes a service.

#### GreetingService
First we will define an interface for our service. We will use this interface to expose our service to the service registry for injection into our service client. 

##### Completed Project Download
For reference, you can download the completed project from [here](https://drive.google.com/file/d/0Bz6zdXGc_G2PUGtMTFlyUXU0X2M/view?usp=sharing). For the source, you can checkout the code from [github](https://github.com/stackleader/osgi-scr-examples).

##### Interface
{% highlight java %}
package com.stackleader.training.osgi.scr.greeting.service;

public interface GreetingService {

    void sayHello(String name);
    
}
{% endhighlight %} 

Next we will create a component that will implement this interface.

##### Implementation 

{% highlight java %}
package com.stackleader.training.osgi.scr.greeting.service.impl;

import aQute.bnd.annotation.component.Component;
import com.stackleader.training.osgi.scr.greeting.service.GreetingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/*
 * This annotation declares the class as an SCR component and specifies
 * that it should be immediately activated once its dependencies have been
 * satisfied. Additionally, because this class implements an interface, it will 
 * automatically be registered as a provider of the GreetingService interface.
 * 
 * Alternatively, if we could have explicitly declared the provided interface using
 * the 'provide' annotation parameter (e.g. @Component(immediate = true, provide = GreetingService.class))
 */
@Component(immediate = true)
public class GreetingServiceImpl implements GreetingService {

    private static final Logger LOG = LoggerFactory.getLogger(GreetingServiceImpl.class);

    public void sayHello(String name) {
        if (!(name == null || name.isEmpty())) {
            LOG.info("Hello " + name);
        } else {
            LOG.error("This service cannot greet the nameless");
        }
    }
}
{% endhighlight %} 

##### GreetingService Project pom.xml

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.stackleader</groupId>
    <artifactId>com.stackleader.training.osgi.scr.greeting.service</artifactId>
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
                        <!--We will expose only the package containing our interface, and hide our implementation class.-->
                        <Export-Package>${project.artifactId}</Export-Package>
                        <!--We need to explicitly specify to the plugin not to import packages exported by this bundle. 
                        This will prevent unnecessary and potentially problematic imports from appearing in our MANIFEST -->
                        <Import-Package>
                            !${project.artifactId},
                            *
                        </Import-Package>
                    </instructions>
                </configuration>
            </plugin>  
        </plugins>
    </build>
</project>
{% endhighlight %} 

##### MANIFEST file
{% highlight text %}
Manifest-Version: 1.0
Bnd-LastModified: 1464359016585
Build-Jdk: 1.8.0_74
Built-By: dcnorris
Bundle-ManifestVersion: 2
Bundle-Name: com.stackleader.training.osgi.scr.greeting.service
Bundle-SymbolicName: com.stackleader.training.osgi.scr.greeting.service
Bundle-Version: 0.0.1
Created-By: Apache Maven Bundle Plugin
Export-Package: com.stackleader.training.osgi.scr.greeting.service;versi
 on="0.0.1"
Import-Package: org.slf4j;version="[1.7,2)"
Require-Capability: osgi.ee;filter:="(&(osgi.ee=JavaSE)(version=1.5))"
Service-Component: OSGI-INF/com.stackleader.training.osgi.scr.greeting.s
 ervice.impl.GreetingServiceImpl.xml
Tool: Bnd-3.0.0.201509101326
{% endhighlight %} 
##### SCR Descriptor xml
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<component name="com.stackleader.training.osgi.scr.greeting.service.impl.GreetingServiceImpl" 
           immediate="true">
  <implementation class="com.stackleader.training.osgi.scr.greeting.service.impl.GreetingServiceImpl"/>
  <service>
    <provide interface="com.stackleader.training.osgi.scr.greeting.service.GreetingService"/>
  </service>
</component>
{% endhighlight %} 

#### Greeting Service Client
{% highlight java %}
package com.stackleader.training.osgi.scr.services.consumer;

import aQute.bnd.annotation.component.Activate;
import aQute.bnd.annotation.component.Component;
import aQute.bnd.annotation.component.Deactivate;
import aQute.bnd.annotation.component.Reference;
import com.stackleader.training.osgi.scr.greeting.service.GreetingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/*
 * This annotation declares the class as an SCR component and specifies
 * that it should be immediately activated once its dependencies have been
 * satisfied. In this instance, the component will be activated after the
 * GreetingService has been injected.
 *
 */
@Component(immediate = true)
public class GreetingServiceClient {

    private static final Logger LOG = LoggerFactory.getLogger(GreetingServiceClient.class);
    private GreetingService greetingService;

    public GreetingServiceClient() {
        LOG.info("GreetingServiceClient instantiated");
    }

    @Activate
    private void activate() {
        LOG.info("GreetingServiceClient component activated");
        greetingService.sayHello("Greeting Service Client");
    }

    /**
     * This annotation is the declaration to SCR that this is the location to
     * inject the GreetingService implementation. We have also included a
     * non-default
     * unbind method reference to indicate the "removeGreetingService" should be
     * called
     * if the GreetingService is no longer available. The default would have
     * been to call
     * a method by the same name as our injection method name prefixed by "un".
     * In
     * this case that would have been "unsetGreetingService".
     */
    @Reference(unbind = "removeGreetingService")
    public void setGreetingService(GreetingService greetingService) {
        LOG.info("GreetingService injection");
        this.greetingService = greetingService;
    }

    /**
     * This method demonstrates the unbind life-cycle hook. 
     */
    public void removeGreetingService(GreetingService greetingService) {
        LOG.info("GreetingService removed");
    }

    @Deactivate
    public void deactivate() {
        LOG.info("GreetingServiceClient deactivated");
    }
}

{% endhighlight %} 

##### GreetingService Client pom.xml

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.stackleader</groupId>
    <artifactId>com.stackleader.training.osgi.scr.greeting.service.client</artifactId>
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
        <dependency>
            <groupId>com.stackleader</groupId>
            <artifactId>com.stackleader.training.osgi.scr.greeting.service</artifactId>
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
                        <!-- This is included as a best practice, by default this plugin 
                        will expose all packages. In our case, we do not want to expose 
                        any packages.-->
                        <Export-Package></Export-Package>
                    </instructions>
                </configuration>
            </plugin>  
        </plugins>
    </build>
</project>


{% endhighlight %} 

##### MANIFEST file
{% highlight text %}
Manifest-Version: 1.0
Bnd-LastModified: 1464360360888
Build-Jdk: 1.8.0_74
Built-By: dcnorris
Bundle-ManifestVersion: 2
Bundle-Name: com.stackleader.training.osgi.scr.greeting.service.client
Bundle-SymbolicName: com.stackleader.training.osgi.scr.greeting.service.
 client
Bundle-Version: 0.0.1
Created-By: Apache Maven Bundle Plugin
Import-Package: com.stackleader.training.osgi.scr.greeting.service;versi
 on="[0.0,1)",org.slf4j;version="[1.7,2)"
Require-Capability: osgi.ee;filter:="(&(osgi.ee=JavaSE)(version=1.5))"
Service-Component: OSGI-INF/com.stackleader.training.osgi.scr.services.c
 onsumer.GreetingServiceClient.xml
Tool: Bnd-3.0.0.201509101326
{% endhighlight %} 

##### SCR Descriptor xml
{% highlight java %}
<?xml version="1.0" encoding="UTF-8"?>
<scr:component xmlns:scr="http://www.osgi.org/xmlns/scr/v1.1.0" 
               name="com.stackleader.training.osgi.scr.services.consumer.GreetingServiceClient" 
               immediate="true" 
               activate="activate" 
               deactivate="deactivate">
  <implementation class="com.stackleader.training.osgi.scr.services.consumer.GreetingServiceClient"/>
  <reference name="greetingService" 
             cardinality="1..1" 
             interface="com.stackleader.training.osgi.scr.greeting.service.GreetingService" 
             bind="setGreetingService" 
             unbind="removeGreetingService"/>
</scr:component>
{% endhighlight %} 

#### Running the Project
 
 1. Download the completed project ([link](https://drive.google.com/file/d/0Bz6zdXGc_G2PUGtMTFlyUXU0X2M/view?usp=sharing))
 2. Navigate to the download location and explode the compressed artifact. 
 3. Move into the root of the exploded artifact (i.e. the felix-framework-5.4.0 directory)
 4. Run the felix.jar file from the context of the root directory
 {: .normal-list-style}
Example)
{% highlight bash %}
cd ~/Downloads
tar xzvf com.stackleader.training.osgi.scr.services.tar.gz
cd felix-framework-5.4.0
java -jar bin/felix.jar
{% endhighlight %} 

This will launch the gogo shell. Also, you should see the logging output from the SCR container initalizing and activating our GreetingServiceClient.

Exmaple Output:
{% highlight text %}
INFO  c.s.t.o.s.s.c.GreetingServiceClient - GreetingServiceClient instantiated
INFO  c.s.t.o.s.s.c.GreetingServiceClient - GreetingService injection
INFO  c.s.t.o.s.s.c.GreetingServiceClient - GreetingServiceClient component activated
INFO  c.s.t.o.s.g.s.i.GreetingServiceImpl - Hello Greeting Service Client
{% endhighlight %} 

Now, lets demonstrate what happens when we disable the GreetingServiceImpl component.

 1. Run the scr:list command to see a listing of the SCR components.
 2. Run the 'scr:disable com.stackleader.training.osgi.scr.greeting.service.impl.GreetingServiceImpl' command to disable our component
 {: .normal-list-style}
Note the logging output.

Example Output:
{% highlight text %}
INFO  c.s.t.o.s.s.c.GreetingServiceClient - GreetingServiceClient deactivated
INFO  c.s.t.o.s.s.c.GreetingServiceClient - GreetingService removed
{% endhighlight %} 

Finally, lets re-enable the service to demonstrate how SCR will handle this event.

 1. Run the 'scr:enable com.stackleader.training.osgi.scr.greeting.service.impl.GreetingServiceImpl' command to enable our component

Example Output:
{% highlight bash %}
scr:enable com.stackleader.training.osgi.scr.greeting.service.impl.GreetingServiceImpl
Component com.stackleader.training.osgi.scr.greeting.service.impl.GreetingServiceImpl enabled
INFO  c.s.t.o.s.s.c.GreetingServiceClient - GreetingServiceClient instantiated
INFO  c.s.t.o.s.s.c.GreetingServiceClient - GreetingService injection
INFO  c.s.t.o.s.s.c.GreetingServiceClient - GreetingServiceClient component activated
INFO  c.s.t.o.s.g.s.i.GreetingServiceImpl - Hello Greeting Service Client
{% endhighlight %} 

Full Example Shell)
![Project Run Summary](/img/blog/scr_example_5.png)



