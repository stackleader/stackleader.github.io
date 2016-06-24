---
layout: post
title:  "Implementing gRPC Service and Client"
description: "This explains how to use generated gRPC code to implement and consume gRPC services"
imageSmall: /img/blog/grpc.png
imageLarge: /img/blog/grpc_large.png
date:   2016-06-24 15:29:00 -0400
categories: grpc
tags: [grpc, maven]
---
<!-- MarkdownTOC -->

- [Overview](#overview)
    - [Source Code](#source-code)
    - [Project Structure](#project-structure)
    - [Implementing the Service](#implementing-the-service)
        - [GreeterService.java](#greeterservicejava)
    - [Implementing the Server and Registering our Service Implementation](#implementing-the-server-and-registering-our-service-implementation)
        - [HelloWorldServer.java](#helloworldserverjava)
    - [Implementing the Client](#implementing-the-client)
    - [Running the example in the StackLeader Karaf container](#running-the-example-in-the-stackleader-karaf-container)
        - [Step 1](#step-1)
        - [Step 2](#step-2)
        - [Step 3](#step-3)
        - [Install the Demo Feature File](#install-the-demo-feature-file)
        - [Step 4](#step-4)
    - [Expected Results](#expected-results)

<!-- /MarkdownTOC -->

### Overview
This post expands on our previous blog on [generating gRPC code with Maven](/grpc/2016/06/24/generating-grpc-code-with-maven.html){:target="_blank"}, and explains how to use the generated api jar to implement a gRPC service and client. This example uses the StackLeader dockerized karaf container to illustrate running the service and connecting to the service with the client. This is largely done to simplify the process of running the example.  

#### Source Code
The source code for this example is available on [github](https://github.com/stackleader/karaf-grpc){:target="_blank"}.

#### Project Structure
![Tree View](/img/blog/grpc_impl_1.png)

#### Implementing the Service 
To implement the service, we need to extend the generated GreeterGrpc.AbstractGreeter class. 

##### GreeterService.java
{% highlight java %}
package com.stackleader.training.grpc.helloworld.server.internal;

import com.stackleader.training.grpc.helloworld.api.GreeterGrpc;
import com.stackleader.training.grpc.helloworld.api.HelloReply;
import com.stackleader.training.grpc.helloworld.api.HelloRequest;
import io.grpc.BindableService;
import io.grpc.stub.StreamObserver;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component(immediate = true)
public class GreeterService extends GreeterGrpc.AbstractGreeter implements BindableService{

    private static final Logger LOG = LoggerFactory.getLogger(GreeterService.class);

    @Override
    public void sayHello(HelloRequest request, StreamObserver<HelloReply> responseObserver) {
        LOG.info("sayHello endpoint received request from " + request.getName());
        HelloReply reply = HelloReply.newBuilder().setMessage("Hello " + request.getName()).build();
        responseObserver.onNext(reply);
        responseObserver.onCompleted();
    }

}
{% endhighlight %} 

#### Implementing the Server and Registering our Service Implementation
To expose our service implementation, a gRPC server endpoint needs to be constructed. In this case, we have registered our service implementation as an implementation of the gRPC BindableService interface, and as a result we can easily inject this implementation into our Server class for registration.  Additionally, we have registered our HelloWorldServer class as implementing an empty GrpcServer interface in order to provide a lifecycle hook for our service client (i.e. we want our client implementation to wait for the server before it tries to make a connection). 

##### HelloWorldServer.java
{% highlight java %}
package com.stackleader.training.grpc.helloworld.server.internal;

import com.stackleader.training.grpc.helloworld.server.GrpcServer;
import io.grpc.BindableService;
import io.grpc.Server;
import io.grpc.netty.NettyServerBuilder;
import java.io.IOException;
import java.util.concurrent.CompletableFuture;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component(immediate = true)
public class HelloWorldServer implements GrpcServer {

    private static final Logger LOG = LoggerFactory.getLogger(HelloWorldServer.class);
    private final int port = 5000;
    private Server server;
    private BindableService greeterService;

    @Activate
    public void activate() {
        start();
    }

    private void start() {
        try {
            server = NettyServerBuilder
                    .forPort(port)
                    .addService(greeterService)
                    .build()
                    .start();
            LOG.info("Server started, listening on {}", port);
            CompletableFuture.runAsync(() -> {
                try {
                    server.awaitTermination();
                } catch (InterruptedException ex) {
                    LOG.error(ex.getMessage(), ex);
                }
            });
        } catch (IOException ex) {
            LOG.error(ex.getMessage(), ex);
        }
    }

    @Reference
    public void setGreeterService(BindableService greeterService) {
        this.greeterService = greeterService;
    }

    @Deactivate
    public void deactivate() {
        if (server != null) {
            server.shutdown();
        }
    }

}
{% endhighlight %} 

#### Implementing the Client
In order to implement a gRPC client, we need to create an instance of one of the stub classes implementing the GreeterBlockingClient class or the GreeterFutureClient class. For this example, we have chosen to instantiate a GreeterGrpc.GreeterBlockingStub instance. As mentioned above, in order to ensure the gRPC server has been started, we inject the GrpcServer service into our HelloWorldClient component. After the gRPC Server is injected we make a connection to the server and invoke the sayHello method.

HelloWorldClient.java
{% highlight java %}
package com.stackleader.training.grpc.helloworld.client;

import com.stackleader.training.grpc.helloworld.api.GreeterGrpc;
import com.stackleader.training.grpc.helloworld.api.HelloReply;
import com.stackleader.training.grpc.helloworld.api.HelloRequest;
import com.stackleader.training.grpc.helloworld.server.GrpcServer;
import io.grpc.ManagedChannel;
import io.grpc.StatusRuntimeException;
import io.grpc.okhttp.OkHttpChannelBuilder;
import java.util.concurrent.TimeUnit;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component(immediate = true)
public class HelloWorldClient {

    private static final Logger LOG = LoggerFactory.getLogger(HelloWorldClient.class);

    private final String host = "localhost";
    private final int port = 5000;
    private ManagedChannel channel;
    private GreeterGrpc.GreeterBlockingStub blockingStub;

    @Activate
    public void activate() {
        channel = OkHttpChannelBuilder.forAddress(host, port)
                .usePlaintext(true)
                .build();
        blockingStub = GreeterGrpc.newBlockingStub(channel);
        try {
            greet("world");
            shutdown();
        } catch (InterruptedException ex) {
            LOG.error(ex.getMessage(), ex);
        }
    }

    public void shutdown() throws InterruptedException {
        channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
    }

    /**
     * Say hello to server.
     */
    public void greet(String name) {
        LOG.info("Will try to greet " + name + " ...");
        HelloRequest request = HelloRequest.newBuilder().setName(name).build();
        HelloReply response;
        try {
            response = blockingStub.sayHello(request);
        } catch (StatusRuntimeException e) {
            LOG.warn("RPC failed: {0}", e.getStatus());
            return;
        }
        LOG.info("Greeting: " + response.getMessage());
    }

    @Reference
    public void setGrpcServer(GrpcServer grpcServer) {
        //ensures the server has started before we attempt to connect
    }
}
{% endhighlight %} 

#### Running the example in the StackLeader Karaf container
For convenience, we have made available an open source Docker container that will be used in the Karaf blog posts.

[stackleader-karaf-container](https://github.com/stackleader/karaf-container)

##### Step 1
Clone and build the project from [github](https://github.com/stackleader/karaf-grpc){:target="_blank"} (i.e. mvn clean install from the root of the project).

##### Step 2
Pull down the latest stackleader karaf-container
{% highlight text %}
docker pull stackleader/karaf:latest
{% endhighlight %}

##### Step 3
Start the karaf shell
{% highlight text %}
docker run -it -v ~/.m2:/opt/karaf/.m2 stackleader/karaf shell
{% endhighlight %}

##### Install the Demo Feature File
From the karaf shell run the following commands.
{% highlight text %}
repo-add mvn:com.stackleader/com.stackleader.training.grpc.helloworld.feature/0.0.1/xml/features
feature:install com.stackleader.training.grpc.helloworld.feature
{% endhighlight %}

##### Step 4
View the logs to confirm the client was able to communicate to the server. From the karaf shell run the log:tail command.

{% highlight text %}
log:tail
{% endhighlight %}

#### Expected Results
![Log Output](/img/blog/grpc_impl_2.png)