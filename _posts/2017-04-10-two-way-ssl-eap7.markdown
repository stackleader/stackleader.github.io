---
layout: post
title:  "Configuring Two-way SSL on EAP 7"
description: "This post provides an introduction to two-way ssl and setup on EAP 7"
imageSmall: /img/blog/ssl.png
imageLarge: /img/blog/ssl.png
date:   2017-04-10 11:48:00 -0400
categories: eap_7
tags: [eap_7, java]
---

<h1 style="page-break-before:always;"></h1>
<!-- MarkdownTOC -->

- [Configuring Two-way SSL Authentication on EAP 7](#configuring-two-way-ssl-authentication-on-eap-7)
    - [Creating certificates](#creating-certificates)
        - [Creating the server certificate](#creating-the-server-certificate)
        - [Creating the client certificate](#creating-the-client-certificate)
        - [Exporting the client certificate](#exporting-the-client-certificate)
        - [Exporting the server certificate](#exporting-the-server-certificate)
        - [Importing the server certificate to the client](#importing-the-server-certificate-to-the-client)
        - [Importing the client certificate to the server](#importing-the-client-certificate-to-the-server)
        - [Asciinema Demo](#asciinema-demo)
    - [Configure Two Way SSL for the management Interface in EAP 7](#configure-two-way-ssl-for-the-management-interface-in-eap-7)
        - [Using the CLI to configure the management interface](#using-the-cli-to-configure-the-management-interface)
            - [Updating the ManagementRealm for SSL](#updating-the-managementrealm-for-ssl)
        - [Resulting XML](#resulting-xml)
    - [Configure https listener for the undertow subsystem on EAP 7 for SSL and enforce client certificate verification](#configure-https-listener-for-the-undertow-subsystem-on-eap-7-for-ssl-and-enforce-client-certificate-verification)
    - [Configuring the jboss-cli.sh for two-way SSL](#configuring-the-jboss-clish-for-two-way-ssl)
- [Enforcing HTTPS](#enforcing-https)
    - [Completely remove https listener \(preferred approach\)](#completely-remove-https-listener-preferred-approach)
        - [Cli commands](#cli-commands)
    - [Enforcing HTTPS](#enforcing-https-1)
        - [Add Strict-Transport-Security header](#add-strict-transport-security-header)
        - [Use servlet api transport guarantee](#use-servlet-api-transport-guarantee)

<!-- /MarkdownTOC -->


## Configuring Two-way SSL Authentication on EAP 7

![two-way_ssl_eap_7](/img/blog/two-way_ssl_eap_7.png)

In this example, a single jks file is used as both the keystore and the truststore for both the client and server. It is useful to call attention to this detail as it would be common to use separate jks files or in some cases to simply append the trusted certificates or certificate authoricity certs into the jre's truststore. 


### Creating certificates

It is possible to create certificates using other methods (e.g. openssl); however, the java keytool utility is used in this example. Throughout the example, it is important to keep in mind that you should replace the parameter values being passed to be values that makes sense for your environment.

#### Creating the server certificate 

{% highlight bash %}
keytool -genkeypair -alias server -keyalg RSA -keystore server_keystore.jks -keysize 2048 -dname "CN=sslExample,OU=redhat-consulting,O=redhat,L=US,ST=NJ,C=US" -keypass asd56jko -storepass asd56jko
{% endhighlight %} 

#### Creating the client certificate 

{% highlight bash %}
keytool -genkeypair -alias client -keyalg RSA -keystore client_keystore.jks -keysize 2048 -dname "CN=sslExample,OU=redhat-consulting,O=redhat,L=US,ST=NJ,C=US" -keypass asd56jko -storepass asd56jko
{% endhighlight %} 

#### Exporting the client certificate

{% highlight bash %}
keytool -exportcert -rfc -alias client -file client.cer -keypass asd56jko -keystore client_keystore.jks -storepass asd56jko
{% endhighlight %} 


#### Exporting the server certificate

{% highlight bash %}
keytool -exportcert -rfc -alias server -file server.cer -keypass asd56jko -keystore server_keystore.jks -storepass asd56jko
{% endhighlight %} 

#### Importing the server certificate to the client 

{% highlight bash %}
keytool -importcert -alias server -file server.cer -keystore client_keystore.jks -storepass asd56jko -noprompt
{% endhighlight %} 

#### Importing the client certificate to the server 

{% highlight bash %}
keytool -importcert -alias client -file client.cer -keystore server_keystore.jks -storepass asd56jko -noprompt
{% endhighlight %} 

#### Asciinema Demo 
<script type="text/javascript" src="https://asciinema.org/a/cms9iztfzalatg83g4l71z0kt.js" id="asciicast-cms9iztfzalatg83g4l71z0kt?speed=2" async></script>

### Configure Two Way SSL for the management Interface in EAP 7

This step assumes the server keystore generated above has been moved to the following location:
{% highlight bash %}
$EAP_HOME/ssl/server_keystore.jks
{% endhighlight %} 

#### Using the CLI to configure the management interface

##### Updating the ManagementRealm for SSL

{% highlight bash %}
/core-service=management/security-realm=ManagementRealm/server-identity= \
ssl:add(keystore-path=${jboss.home.dir}/ssl/server_keystore.jks, keystore-password=asd56jko, \
alias=server)
/core-service=management/security-realm=ManagementRealm/authentication= \
truststore:add(keystore-path=${jboss.home.dir}/ssl/server_keystore.jks,keystore-password=asd56jko)
/core-service=management/management-interface=http-interface:undefine-attribute(name=socket-binding)
{% endhighlight %} 

#### Resulting XML

{% highlight xml %}
<server-identities>
    <ssl>
        <keystore path="${jboss.home.dir}/ssl/server_keystore.jks" keystore-password="asd56jko" alias="server"/>
    </ssl>
</server-identities>
<authentication>
    <truststore path="${jboss.home.dir}/ssl/server_keystore.jks" keystore-password="asd56jko"/>
    <local default-user="$local" skip-group-loading="true"/>
    <properties path="mgmt-users.properties" relative-to="jboss.server.config.dir"/>
</authentication>
<authorization map-groups-to-roles="false">
    <properties path="mgmt-groups.properties" relative-to="jboss.server.config.dir"/>
</authorization>
</security-realm>
{% endhighlight %} 

### Configure https listener for the undertow subsystem on EAP 7 for SSL and enforce client certificate verification
For simplicity, we will use the ManagementRealm in this step. In practice, you may want to setup a new realm for applications or configure the ApplicationRealm.
{% highlight bash %}
/subsystem=undertow/server=default-server/https-listener=https:add(socket-binding=https, security-realm=ManagementRealm, verify-client=REQUIRED)
{% endhighlight %} 

### Configuring the jboss-cli.sh for two-way SSL
Update jboss-cli.xml.

{% highlight xml %}
<ssl>
    <alias>client</alias>
    <key-store>../ssl/client_keystore.jks</key-store>
    <key-store-password>asd56jko</key-store-password>
    <key-password>asd56jko</key-password>
    <trust-store>../ssl/client_keystore.jks</trust-store>
    <trust-store-password>asd56jko</trust-store-password>
    <modify-trust-store>false</modify-trust-store>
</ssl>
{% endhighlight %} 

Running the CLI after adding ssl configuration:
{% highlight bash %}
sh jboss-cli.sh -c --controller=https-remoting://localhost:9993
{% endhighlight %} 

Update jboss-cli.xml defaults (Optional)
{% highlight xml %}
<default-controller>
    <protocol>https-remoting</protocol>
    <host>localhost</host>
    <port>9993</port>
</default-controller>
{% endhighlight %} 
After changing the defaults, it is possible to run the cli without additional parameters.
</web-app>

## Enforcing HTTPS
Configuring HTTPS does not enforce the use of https. To prevent the possibility of unsecure connections, you can do a number of things.

### Completely remove https listener (preferred approach)
To completely remove http as an option, you can remove the undertow http listener and update the references to it. When an edge approapriate proxy is sitting in front of EAP (e.g. apache/nginx), this configuration typically makes the most sense. If there was no proxy redirecting http to https, this setup may not be ideal since it would prevent http redirects to https.

#### Cli commands
{% highlight bash %}
/subsystem=undertow/server=default-server/http-listener=default:remove
{% endhighlight %} 

### Enforcing HTTPS 


#### Add Strict-Transport-Security header 

{% highlight bash %}
/subsystem=undertow/configuration=filter/response-header=hsts-header:add(header-name="Strict-Transport-Security", header-value="max-age=31536000;")
/subsystem=undertow/server=default-server/host=default-host/filter-ref=hsts-header:add()
{% endhighlight %} 

#### Use servlet api transport guarantee
At the applcation level, you can also add a CONFIDENTIAL transport guarantee to web.xml
 {% highlight xml %}
 <?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://java.sun.com/xml/ns/javaee"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
version="3.0"
xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd">
  ...
  <security-constraint>
    <web-resource-collection>
        <web-resource-name>Secure URLs</web-resource-name>
        <url-pattern>/*</url-pattern>
    </web-resource-collection>
    <user-data-constraint>
        <transport-guarantee>CONFIDENTIAL</transport-guarantee>
    </user-data-constraint>
  </security-constraint>
  ...
  </web-app>
 {% endhighlight %} 

<h1 style="page-break-before:always;"></h1>