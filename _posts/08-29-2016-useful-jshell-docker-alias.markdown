---
layout: post
title:  "Docker + JShell + Bash Alias Tip"
description: "This post provides a useful tip for those interested in using JShell to enhance their productivity"
imageSmall: /img/blog/bash.png
imageLarge: /img/blog/bash_large.png
date:   2016-08-29 20:29:00 -0400
categories: bash
tags: [bash, java, docker]
---
<!-- MarkdownTOC -->

- [Overview](#overview)
- [JShell with Docker](#jshell-with-docker)
    - [Launch JShell](#launch-jshell)
    - [Bash Alias/Function Convenience](#bash-aliasfunction-convenience)
        - [Adding a lib directory to the classpath](#adding-a-lib-directory-to-the-classpath)
        - [Adding your current directory to the classpath](#adding-your-current-directory-to-the-classpath)

<!-- /MarkdownTOC -->

### Overview
This post brings together two of my favorite things: bash aliases/functions and docker containers. To those who have not heard, Java 9 will include a new  Java [REPL](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop) called JShell. This is exciting in a number of ways. Newcomers to the language should find the learning curve less painful, and seasoned developers will gain a useful tool for exploring new libraries and interactive programming. JShell has already become a tool I use daily, and it has largely replaced my habit of writing disposable JUnit tests simply to explore a new library's behavior or work out a specific function. 

With some help from docker, you can easily start exploring JShell.  

### JShell with Docker
The following command uses the official openjdk docker hub image.

#### Launch JShell
{% highlight bash %}
 docker run --rm=true -it openjdk:9 jshell 
{% endhighlight %}

#### Bash Alias/Function Convenience
To get the most value out of your JShell experience, you will likely want to add library jars to your classpath. This can easily be accomplished using a volume mount and a small modification to our jshell command. For convenience, I have the following bash functions defined to make launching a JShell instance with a useful classpath convenient.  

##### Adding a lib directory to the classpath
{% highlight bash %}
function jshell(){
 docker run --rm=true -it -v ~/utils/jshell/libs:/tmp/context openjdk:9 /usr/bin/jshell -classpath "/tmp/context/*"
}
{% endhighlight %}

##### Adding your current directory to the classpath
{% highlight bash %}
function jshellpwd(){
 docker run --rm=true -it -v ${PWD}:/tmp/context openjdk:9 /usr/bin/jshell -classpath "/tmp/context/*"
}
{% endhighlight %}
