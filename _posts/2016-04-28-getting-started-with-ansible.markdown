---
layout: post
title:  "Getting Started with Ansible"
description: "Ansible is a powerful IT automation tool to simply provisioning and deployments."
imageSmall: /img/blog/ansible_small.png
imageLarge: /img/blog/ansible_large.png
date:   2016-04-28 10:57:33 -0400
categories: automation
tags: [automation]
---
Ansible is the perfect tool for automating provisioning, application deployments, and other various repetitive IT tasks. Before we get started let's take a moment and discuss the basic architecture of Ansible.

Ansible has the concept of a playbook which as you might guess contains a series of plays. These plays define a series of tasks that do your grunt work. See the attached files for this post for an example playbook. I will use the provided example throughout this post.

A playbook will have the following file structure:

![ansible folder structure](/img/blog/ansible_1.png)


| **File/Folder** | **Description** |
| deployment_com_johneckstein.yml | A yaml file defining the playbook |
| group_vars | Property sheets for each group |
| inventory | Defines the hosts and groups available in your inventory |
| roles| Roles that are available to the playbook |
| roles/deploy_com_johneckstein/defaults | Default variables for a role |
| roles/deploy_com_johneckstein/files | Files that can be referenced within a role |
| roles/deploy_com_johneckstein/meta | Meta information such as roles this role is dependent on |
| roles/deploy_com_johneckstein/tasks | The tasks to execute for this role |
| roles/deploy_com_johneckstein/templates | Templates using the jinja2 templating engine |

#### Variables
Variables play a very important role in Ansible. The goal of your playbook is to create a series of tasks that are all executed regardless of which environment you are deploying to. The tasks will not change but the variables that are defined for that environment (e.g dev, prod) will change. Variables can be defined in several locations throughout the playbook and it is important to understand the precedence for each of these locations. 

{% highlight text %}
Note: I haven't defined where to define variables but for now just know that variables can be defined on each host e.g. johneckstein.com and on groups of hosts e.g. [node1.johneckstein.com, node2.johneckstein.com]
{% endhighlight %}

1. Extra vars (-e in the command line) always win
2. Connection variables defined in inventory (ansible_ssh_user, etc)
3. Then comes "most everything else" (command line switches, vars in play, included vars, role vars, etc)
4. The remaining variables defined in inventory
5. Facts discovered about a system
6. Role defaults

Above is from the Ansible documentation. I will add that...

* Child group vars override parent group vars and host vars override group vars
* The group_vars/all will provide site wide defaults but these can be overridden by the specific group vars

#### Templating
Ansible uses the Jinja2 templating system to template the playbooks and for the template module. Variables may be referenced throughout the playbook with following syntax: ```{% raw %}{{variable_name}}{% endraw %}```. For example, the playbook deployment_com_johneckstein.yml templatizes the host and remote_user variables.

{% highlight text %}
Note that variable references within yaml files must be enclosed in quotes
{% endhighlight %}

{% highlight yaml %}
- name: "Deploy the sample web application"
   hosts: "{{ hosts }}"
   remote_user: "{{ user }}"
   roles:
     - { role: deploy_com_johneckstein, tags: [ 'deploy' ] } 
{% endhighlight %}    

Ansible includes a template module which will load templates files and populate the placeholders.

{% highlight yaml %}
{% raw %}
 - name: "template index.html.j2"
   template:
     src: "index.html.j2"
     dest: "{{ www_home }}/{{ application_home }}/index.html" 
{% endraw %}
{% endhighlight %}
     
Jinja allows filters to manipulate the data for a placeholder. Use the "\|" symbol to denote that a filter will follow. A possible filter is regex_replace which uses a regular expression to replace a string within a string. The example below demonstrates replacing \".\" for \"_\".

{% highlight yaml %}
{% raw %}
 {{ version | regex_replace('.', '_') }}
{% endraw %}
{% endhighlight %}

#### Role Dependencies
Roles may have dependencies on other roles. Dependencies for a role are defined in the ```meta/main.yml``` file within the role's folder. Let's take a look at ```roles/deploy_com_johneckstein/meta``` for an example.

{% highlight yaml %}
{% raw %}
 ---
 dependencies:
   - { role: deploy_bootstrap } 
{% endraw %}
{% endhighlight %}
     
#### Tasks
A playbook may execute several tasks but each task is logically grouped into roles. Let's take a look at ```roles/deploy_com_johneckstein_example/tasks/main.yml``` for an example.

{% highlight yaml %}
{% raw %}
---
 - name: "template index.html.j2"
   template:
     src: "index.html.j2"
     dest: "{{ application_home }}/{{ application_name }}/index.html"
 
 - name: "verify deployment"
   script: "verify.sh {{ application_home }}/{{ application_name }}/index.html" 
{% endraw %}
{% endhighlight %}

This role defines two tasks. The name section simply defines a name for this task. You should always name your tasks for clarity. The next line after name defines which Ansible module to use. The first task is using the template module which as I mentioned above reads in a Jinja2 template located at src and copies the output to the host at dest. The src attribute is a path in the local Ansible project relative to the template directory in the role. The dest is an absolute path on the host.

The verify deployment task uses the script module. The script attribute of this task defines a script path that is relative to the files directory in the role. Following the script name is a space delimited list of arguments to pass to the script when executed. Ansible will copy this script to the host and execute it in a temporary location.

#### Inventory
The inventory within Ansible defines available hosts and how they are grouped. You can also define properties that are specific to a host by adding the property inline with the hostname.

{% highlight yaml %}
{% raw %}
[local]
 localhost ansible_connection=local
 
 [dev]
 node1.dev.johneckstein.com
 node2.dev.johneckstein.com
 
 [qa]
 node1.qa.johneckstein.com
 node2.qa.johneckstein.com
 
 [prod]
 node1.johneckstein.com
 node2.johneckstein.com 
{% endraw %}
{% endhighlight %}

The group names are defined within the square brackets. This name should correspond to a file in ```group_vars/``` for group specific properties.

#### Running the Sample Playbook

Now that we have a basic understanding of an Ansible project. let's work through the sample playbook that I have provided for this lab. <https://github.com/jeckste/getting_started_with_ansible>

{% highlight yaml %}
 git clone https://github.com/jeckste/getting_started_with_ansible.git 
{% endhighlight %}

You should be able to run this playbook on any linux or Mac OS X system. Go ahead and navigate to the folder ```getting_started_with_ansible/introduction```. Now let's run the playbook from the command line. Don't forget to replace ```YOUR_OS_USERNAME``` with the username that you are currently logged in with.

{% highlight yaml %}
ansible-playbook -i inventory deployment_com_johneckstein_example.yml -e 'hosts=local user=YOUR_OS_USERNAME version=1.0.0 ' --tags "deploy" 
{% endhighlight %}

| ansible-playbook | Application for interpreting your playbook |
| -i | Option to pass a custom inventory to the playbook |
| deployment_com_johneckstein_example.yml | Yaml file with plays |
| -e | Option to pass additional properties to the playbook. These properties override all. |
| --tags | Comma delimited list of tags. Only plays or tasks that have matching tags will execute. |

If all is well you should see output similar to below.

{% highlight text %}
{% raw %}
 PLAY [deploy] ***************************************************************** 
 
 GATHERING FACTS *************************************************************** 
 ok: [localhost]
 
 TASK: [is_application_home_available | create application folder] ************* 
 changed: [localhost] => (item={'dest': u'/tmp/ansible_example'})
 
 TASK: [deploy_bootstrap | upload bootstrap-3.3.2-dist.zip] ******************** 
 changed: [localhost]
 
 TASK: [deploy_bootstrap | extract bootstrap-3.3.2-dist.zip] ******************* 
 changed: [localhost]
 
 TASK: [deploy_com_johneckstein_example | template index.html.j2] ************** 
 changed: [localhost]
 
 TASK: [deploy_com_johneckstein_example | verify deployment] ******************* 
 changed: [localhost]
 
 PLAY RECAP ******************************************************************** 
 localhost : ok=6 changed=5 unreachable=0 failed=0
{% endraw %}
{% endhighlight %}

This playbook should install a simple bootstrap application at ```/tmp/ansible_example/index.html```