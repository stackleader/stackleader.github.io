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

#### What is the Apache Felix Service Component Runtime?
The Apache Felix Service Component Runtime (SCR) is an implementation of the OSGi Declarative Services specification, a specification designed with the expressed purpose of simplifying the creation and consumption of OSGi services. To unpack this a bit more, it's important to understand that in OSGi, "services" and not objects are intended to be the design primitives in OSGi. An OSGi service is a java object implementing one or more interfaces that is placed into (i.e. "registered") the service registry. Services in the service registry are expected to be consumed through their abstractions (i.e. their interfaces), allowing implementation details to be hidden from service consumers. The design of the service registry coupled with the bundle classloading architecture in OSGi allows for the enforcement of interface-based programming through the enforcement of the [dependency inversion principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle). 

In a typical scenario, OSGi bundles will export packages containing high level abstractions (e.g. interfaces), and leave implementation classes hidden. This allows developers to enforce good OOP design through runtime classloader boundaries. Working with the service registry has historically involved a fairly significant amount of boilerplate code and services dependencies have been resolved using the service locator pattern. The Felix SCR Declarative Services Implementation removes the ceremonial boilerplate from interacting with the service registry by introducing a dependency injection container that is designed for dealing with the dynamic nature of OSGi services. 

#### What is Dependency Injection?
Dependency injection is a form of [\"inversion of control\"](https://en.wikipedia.org/wiki/Inversion_of_control) where instead of an object being passed all of its dependencies through a **manual** call to its constructor, or through building or manually locating them,they are provided (i.e. injected) to the object by a container. Its worth noting many injection containers emphasize or enforce "constructor injection", but the container takes on the responsibility for instantiating the object with references. The idea of a container managing the lifecycle of objects is something that can take some getting use to if you are new to the world of depdency injection; however, once it is understood that objects that will undergo dependency injection are objects that are "managed" by a framework it should be easier to get your head around the concept.

#### Benefits of Dependency Injection Containers
There are many benefits to using a depdency injection container, but I will only cover this briefly since the topic has been covered well elsewhere (e.g. [here](https://www.youtube.com/watch?v=8RGhT-YySDY),). 

 - Reduced boilerplate (e.g. factories, singletons)
 - Simplifies use of abstractions
 - Dependency graph is explicit, making it easier to avoid depdency cycles (very common in when static object references are easy to reference... i.e. singleton pattern)
 - Testing is simplified 
  - dependencies are explicit
  - Easier to mock
 - Makes modularity easier to achieve
  - encourages single responsibility principle


