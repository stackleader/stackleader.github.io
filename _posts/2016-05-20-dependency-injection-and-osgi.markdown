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
For us fans of OSGi, project Jigsaw is simultaneously exciting and disappointing. It's exciting to see the community focusing on and discussing 
the many benefits of modularity, but it's also disappointing to see that project Jigsaw will for now largely fail to meet the needs of application developers
who wish to build robust modular software systems (more on this in a future blog perhaps). The good news of course is that java developers already have access to 
a robust and mature framework for developing modular software systems, OSGi. In this post, I'd like to introduce the Apache Felix Service Component 
Runtime (SCR) implementation of the OSGi Declarative Services Specification, and how it can be used as a powerful dependency injection framework to facilitate 
and enforce many OOP (Object Oriented Programming) best practices.

#### What is the Apache Felix Service Component Runtime?
The Apache Felix Service Component Runtime (SCR) is an implementation of the OSGi Declarative Services specification, a specification designed with the expressed purpose of 
simplifying the creation and consumption of OSGi services. To unpack this a bit more, it's important to understand that in OSGi, "services" and not objects are 
the design primitives. An OSGi service is a java object implementing one or more interfaces that is placed into (i.e. "registered") the service registry. Services in 
the service registry are designed to be consumed through their abstractions (i.e. their interfaces), allowing implementation details to be hidden 
from service consumers. The design of the service registry coupled with the bundle classloading architecture in OSGi allows for the enforcement of 
interface-based programming by strictly enforcing the dependency inversion principle (see https://en.wikipedia.org/wiki/Dependency_inversion_principle). 

In a typical scenario, OSGi bundles will export packages containing high level abstractions (e.g. interfaces), and leave implementation classes hidden. 
This all adds up to the ability to enforce good OOP design through runtime classloader boundaries.

The Felix SCR Declarative Services Implementation reduces the ceremonial boilerplate out of interacting with the service registry. It achieves this in part
by introducing a dependency injection system that is designed for dealing with the dynamic nature of OSGi services. 

#### What is Dependency Injection?
It is much easier to explain what dependency injection is once one understands it to be a feature of an object lifecycle management framework. The more formal 
definitions tend to overlook this bit of context. Put somewhat more formally, dependency injection is a form of "inversion of control" where instead 
of an object being passed all of its dependencies through its constructor, or through building or manually locating them, they are provided (i.e. injected) 
to the object by the dependency injection framework. For any of this to be possible, the object that is being "injected" with its dependencies 
must be managed by the dependency injection framework (i.e. it will be instantiated by the framework). 


