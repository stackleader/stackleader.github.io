---
layout: post
title:  "Disabling the admin web console on EAP 7"
description: "This post explains how to disable the admin web console on EAP 7"
imageSmall: /img/blog/java_generic.png
imageLarge: /img/blog/java_generic.png
date:   2017-04-10 13:18:00 -0400
categories: eap_7
tags: [eap_7, java]
---
<!-- MarkdownTOC -->

- [DISABLING EAP 7 ADMINISTRATION WEB CONSOLE](#disabling-eap-7-administration-web-console)
    - [Update the http Management Interface](#update-the-http-management-interface)
        - [CLI command](#cli-command)

<!-- /MarkdownTOC -->


## DISABLING EAP 7 ADMINISTRATION WEB CONSOLE

### Update the http Management Interface
Add console-enabled="false" to <http-interface> in standalone.xml

{% highlight xml %}
<management>
    ...
    <management-interfaces>
        <http-interface security-realm="ManagementRealm" console-enabled="false">
            <socket-binding http="management-http"/>
        </http-interface>
    </management-interfaces>
</management>
{% endhighlight %} 

#### CLI command

{% highlight bash %}
/core-service=management/management-interface=http-interface:write-attribute(name=console-enabled,value=false)
{% endhighlight %} 
