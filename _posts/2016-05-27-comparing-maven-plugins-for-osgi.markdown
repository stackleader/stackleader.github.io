---
layout: post
title:  "Comparing maven plugin options for generating OSGi meta-data"
description: "This post cover the basics of generating an OSGi bundle with maven, and compares two maven plugin options."
imageSmall: /img/blog/osgi_dependency_injection.png
imageLarge: /img/blog/osgi_dependency_injection_large.png
date:   2016-05-27 11:51:00 -0400
categories: osgi
tags: [osgi, dependency_injection]
---
<!-- MarkdownTOC -->

- [Overview](#overview)
    - [Differences between maven-bundle-plugin and bnd-maven-plugin](#differences-between-maven-bundle-plugin-and-bnd-maven-plugin)
        - [Maven LifeCycle Differences](#maven-lifecycle-differences)
        - [BND Configuration format \(pom vs bnd\)](#bnd-configuration-format-pom-vs-bnd)
        - [BND Defaults](#bnd-defaults)
            - [Felix maven-bundle-plugin bnd defaults](#felix-maven-bundle-plugin-bnd-defaults)
            - [bnd-maven-plugin bnd defaults](#bnd-maven-plugin-bnd-defaults)
            - [List of differences \(see above for details\)](#list-of-differences-see-above-for-details)
    - [Example Projects](#example-projects)
        - [bnd-maven-plugin project](#bnd-maven-plugin-project)
            - [pom.xml](#pomxml)
            - [MANIFEST.MF](#manifestmf)
        - [Felix maven-bundle-plugin project](#felix-maven-bundle-plugin-project)
            - [pom.xml](#pomxml-1)
            - [MANIFEST.MF](#manifestmf-1)

<!-- /MarkdownTOC -->

### Overview
This post will cover the differences between the existing options for building OSGi bundles using Maven and provide some useful examples. Historically, there has only been one maven plugin option for building OSGi bundles, the Apache Felix [maven-bundle-plugin](http://felix.apache.org/documentation/subprojects/apache-felix-maven-bundle-plugin-bnd.html); however, another plugin option has recently become available [(see announcement)](http://njbartlett.name/2015/03/27/announcing-bnd-maven-plugin.html), the [bnd-maven-plugin](https://github.com/bndtools/bnd/tree/master/maven/bnd-maven-plugin){:target="_blank"}. Both plugins rely on bndlib (often referred to as the swiss army knife of OSGi) under the hood, but they diverge a bit in the details. 

#### Differences between maven-bundle-plugin and bnd-maven-plugin

##### Maven LifeCycle Differences
The first notable difference between the two plugins is in how they hook into the Maven build lifecycle. The felix maven-bundle-plugin extends the default maven lifecylcle with its own "lifecycle enhancement", and enables a custom packaging type of "bundle". Its noteworthy that it is possible to avoid the use of the custom packaging type [(see here)](http://felix.apache.org/documentation/subprojects/apache-felix-maven-bundle-plugin-bnd.html#adding-osgi-metadata-to-existing-projects-without-changing-the-packaging-type){:target="_blank"}, but this is the expected default and without the use of the "bundle" custom packaging type there are limitations to the plugin (e.g. SCR descriptor files will not get included in the built jar). 

The bnd-maven-plugin is designed instead to hook into the default Maven "process-classes" lifecycle and does not require any custom packaging type. This was a conscious decision on the part of the implementors and was meant to mitigate some of the issues that can be caused by the use of the custom "bundle" packaging type (e.g. interoperability with other Maven plugins). 


##### BND Configuration format (pom vs bnd)
The second major difference between the two plugins is in how bnd configuration is expected to be passed to bnd. The felix maven-bundle-plugin is typical of most Maven plugins in accepting its configuration through the pom.xml.

Example:
{% highlight xml %}
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
{% endhighlight %} 

The bnd-maven-plugin allows the options to either use an external bnd file, or embed bnd directives directly into the plugin configuration of the pom.xml.

Example of embedding bnd content in pom.xml:
{% highlight xml %}
<plugin>
    <groupId>biz.aQute.bnd</groupId>
    <artifactId>bnd-maven-plugin</artifactId>
    <configuration>
        <bnd><![CDATA[
-exportcontents:\
 org.example.api,\
 org.example.types
-sources: true
]]></bnd>
    </configuration>
</plugin>
{% endhighlight %} 

##### BND Defaults

The third significant difference between the two plugins is in the details of the bnd configuration defaults.

###### Felix maven-bundle-plugin bnd defaults

{% highlight text %}
 Bundle-SymbolicName: <groupId>.<artifactId>(if artifactId is prefixed by groupId, it is not included)
 Bundle-Name:        <name> (<name> is <artifactId> when not specified)
 Bundle-Version:      <version>
 Import-Package:      *
 Export-Package:     <groupId>.<artifactId>.* (unless Private-Package is set)
 Bundle-Description:  <description>
 Bundle-License:     <licenses>
 Bundle-Vendor:      <organization>
 Include-Resource:    ${project.build.resources}
{% endhighlight %} 
([source](http://svn.apache.org/repos/asf/felix/trunk/tools/maven-bundle-plugin/src/main/java/org/apache/felix/bundleplugin/BundlePlugin.java){:target="_blank"})

###### bnd-maven-plugin bnd defaults
{% highlight text %}
 Bundle-SymbolicName: <artifactId>
 Bundle-Name:         <name> (<name> is <artifactId> when not specified)
 Bundle-Version:     <version>
 Import-Package:      *
 Export-Package:      exports nothing by default
 Bundle-Description:  not included by default
 Bundle-License:        not included by default
 Bundle-Vendor:        not included by default
 Include-Resource:    ${project.build.resources}
 Private-Package:       *
{% endhighlight %} 
(Source: [link](https://github.com/bndtools/bnd/blob/master/maven/bnd-maven-plugin/src/main/java/aQute/bnd/maven/plugin/BndMavenPlugin.java){:target="_blank"})

###### List of differences (see above for details)
1. Bundle-SymbolicName 
2. Export-Package/Private-Package (This is the most significant functional difference between the defaults)
3. Bundle-Description
4. Bundle-License
5.  Bundle-Vendor

#### Example Projects
For both examples, we will reuse the hello-world SCR compoment java code. The goal will be to show how to package up the very same code using each plugin.
For the source, you can checkout the parent project code from [github](https://github.com/stackleader/osgi-examples){:target="_blank"}.

##### bnd-maven-plugin project

###### pom.xml
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.stackleader</groupId>
    <artifactId>com.stackleader.training.osgi.bnd.plugin</artifactId>
    <packaging>jar</packaging>
    
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
                <groupId>biz.aQute.bnd</groupId>
                <artifactId>bnd-maven-plugin</artifactId>
                <version>3.2.0</version>
                <executions>
                    <execution>
                        <goals>
                            <goal>bnd-process</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-jar-plugin</artifactId>
                <version>3.0.0</version>
                <configuration>
                    <archive>
                        <manifestFile>${project.build.outputDirectory}/META-INF/MANIFEST.MF</manifestFile>
                    </archive>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
{% endhighlight %} 
###### MANIFEST.MF
{% highlight text %} 
Manifest-Version: 1.0
Bundle-SymbolicName: com.stackleader.training.osgi.bnd.plugin
Archiver-Version: Plexus Archiver
Built-By: dcnorris
Bnd-LastModified: 1464817461632
Bundle-ManifestVersion: 2
Import-Package: org.slf4j;version="[1.7,2)"
Require-Capability: osgi.ee;filter:="(&(osgi.ee=JavaSE)(version=1.5))"
Service-Component: OSGI-INF/com.stackleader.training.osgi.scr.HelloScr
 World.xml
Tool: Bnd-3.2.0.201605172007
Bundle-Name: com.stackleader.training.osgi.bnd.plugin
Bundle-Version: 0.0.1
Private-Package: com.stackleader.training.osgi.scr
Created-By: 1.8.0_74 (Oracle Corporation)
Build-Jdk: 1.8.0_74
{% endhighlight %}

##### Felix maven-bundle-plugin project

###### pom.xml
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.stackleader</groupId>
    <artifactId>com.stackleader.training.osgi.felix.plugin</artifactId>
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
###### MANIFEST.MF
{% highlight text %}
Manifest-Version: 1.0
Bnd-LastModified: 1464817552512
Build-Jdk: 1.8.0_74
Built-By: dcnorris
Bundle-ManifestVersion: 2
Bundle-Name: com.stackleader.training.osgi.felix.plugin
Bundle-SymbolicName: com.stackleader.training.osgi.felix.plugin
Bundle-Version: 0.0.1
Created-By: Apache Maven Bundle Plugin
Import-Package: org.slf4j;version="[1.7,2)"
Require-Capability: osgi.ee;filter:="(&(osgi.ee=JavaSE)(version=1.5))"
Service-Component: OSGI-INF/com.stackleader.training.osgi.scr.HelloScrWo
 rld.xml
Tool: Bnd-3.0.0.201509101326
{% endhighlight %} 