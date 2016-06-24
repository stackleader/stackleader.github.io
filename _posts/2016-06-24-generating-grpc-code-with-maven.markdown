---
layout: post
title:  "Generating gRPC Code using Maven"
description: "This post cover the basics of generating GRPC code using Maven."
imageSmall: /img/blog/grpc.png
imageLarge: /img/blog/grpc_large.png
date:   2016-06-24 14:29:00 -0400
categories: grpc
tags: [grpc, maven]
---
<!-- MarkdownTOC -->

- [Overview](#overview)
    - [Source Code](#source-code)
    - [Project Structure](#project-structure)
    - [pom.xml](#pomxml)
    - [helloworld.proto](#helloworldproto)
    - [Generated Source Code](#generated-source-code)
- [Implementing gRPC Service and Client](#implementing-grpc-service-and-client)

<!-- /MarkdownTOC -->

### Overview
This post will cover how to generate a GRPC api jar from a .proto service contract using Maven. This generated api jar can then be used to implement a gRPC service implementation and/or a client for consuming a gRPC service.

#### Source Code
The source code for this example is available on [github](https://github.com/stackleader/karaf-grpc){:target="_blank"}.

#### Project Structure
![Tree View](/img/blog/grpc_maven_1.png)

#### pom.xml
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.stackleader</groupId>
    <artifactId>com.stackleader.training.grpc.helloworld.api</artifactId>
    <packaging>jar</packaging>
    
    <parent>
        <groupId>com.stackleader</groupId>
        <artifactId>com.stackleader.training.grpc</artifactId>
        <version>0.0.1</version>
        <relativePath>../pom.xml</relativePath>
    </parent>
   
    <dependencies>
        <dependency>
            <groupId>io.grpc</groupId>
            <artifactId>grpc-all</artifactId>
        </dependency>
    </dependencies>
    
    <build>
        <extensions>
            <extension>
                <groupId>kr.motd.maven</groupId>
                <artifactId>os-maven-plugin</artifactId>
            </extension>
        </extensions>
        <plugins>
            <plugin>
                <groupId>org.xolstice.maven.plugins</groupId>
                <artifactId>protobuf-maven-plugin</artifactId>
                <configuration>
                    <!--
                      The version of protoc must match protobuf-java. If you don't depend on
                      protobuf-java directly, you will be transitively depending on the
                      protobuf-java version that grpc depends on.
                    -->
                    <protocArtifact>
                        com.google.protobuf:protoc:3.0.0-beta-2:exe:${os.detected.classifier}
                    </protocArtifact>
                    <pluginId>grpc-java</pluginId>
                    <pluginArtifact>
                        io.grpc:protoc-gen-grpc-java:0.14.0:exe:${os.detected.classifier}
                    </pluginArtifact>
                    <protoSourceRoot>
                        ${basedir}/src/main/resources/proto
                    </protoSourceRoot>
                </configuration>
                <executions>
                    <execution>
                        <goals>
                            <goal>compile</goal>
                            <goal>compile-custom</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
            <plugin>
                <groupId>biz.aQute.bnd</groupId>
                <artifactId>bnd-maven-plugin</artifactId>
                <executions>
                    <execution>
                        <goals>
                            <goal>bnd-process</goal>
                        </goals>
                    </execution>
                </executions>
                <configuration>
                    <bnd>
                        <![CDATA[
                        -exportcontents: *
                        ]]>
                    </bnd>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-jar-plugin</artifactId>
                <version>3.0.0</version>
                <configuration>
                    <archive>
                        <manifestFile>
                            ${project.build.outputDirectory}/META-INF/MANIFEST.MF
                        </manifestFile>
                    </archive>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
{% endhighlight %} 

#### helloworld.proto
{% highlight text %}
syntax = "proto3";

option java_multiple_files = true;
option java_package = "com.stackleader.training.grpc.helloworld.api";
option java_outer_classname = "HelloWorld";
option objc_class_prefix = "HLW";

package helloworld;

// The greeting service definition.
service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message HelloReply {
  string message = 1;
}
{% endhighlight %} 

#### Generated Source Code
![Generated Source Code](/img/blog/grpc_maven_3.png)

### Implementing gRPC Service and Client
In [Part 2](/osgi/2016/06/24/implementing-grpc-service-client.html){:target="_blank"} we will cover the basics of how to implement a gRPC service and client using the API jar generated from this maven build.
