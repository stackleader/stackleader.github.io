---
layout: post
title:  "Getting Started with AWS Lambda REST Services"
description: "This post describes how to configure a REST service using AWS Lambda and API Gateway."
imageSmall: /img/blog/aws_lambda_small.png
imageLarge: /img/blog/aws_lambda_large.png
date:   2016-05-27 10:00:00 -0400
categories: cloud
tags: [cloud]
---

#### Configure the Lambda Functions
Go to the AWS Lambda console and select Create a Lambda Function.  If this is your first time creating a function, select Get Started.  AWS provides blueprints to help with defining basic project configuration.  Search in the filter for `hello-world`.  The `hello-world` blueprint defines a basic Node Lambda function.

![Creating a new function](/img/blog/aws-lambda-1.png)

Set the name of the function to `getContacts`, add a meaningful description, and set the runtime to Node.js 4.3.  

![Creating a new function](/img/blog/aws-lambda-2.png)

Add the following code for this function.

{% highlight javascript %}
'use strict';
         
/**
 * Returns the contact matching the id.  Otherwise it returns all contacts.
 */
exports.handler = function(event, context) {
  var id = event.id;
  var response;
  if(id === undefined) {
      console.log('Returning all contacts');
      //Not id specified
      //Mock data
      response = [{
          id: 1,
          name: 'Adam Smith',
          phone: '555-555-5555',
          email: 'adam.smith@stackleader.com'
      },{
          id: 2,
          name: 'Rebecca Knox',
          phone: '222-222-2222',
          email: 'rebecca.knox@stackleader.com'
      }];
  } else {
      console.log('Returning contact with id ' + id);
      //Id specified
      //Mock data
      response = {
          id: id,
          name: 'Adam Smith',
          phone: '555-555-5555',
          email: 'adam.smith@stackleader.com'
      };
  }
  context.done(null, response);
};
{% endhighlight %}

Set the handler to index.handler which is the name of the javascript function that will be invoked.  Set the role to Basic Execution Roll.  This will open a new window that creates the role in the IAM console.

![Creating a new function](/img/blog/aws-lambda-4.png)

![IAM roll configuration](/img/blog/aws-lambda-3.png)

The advanced setting should not require modification but should have the following values.

![Creating a new function](/img/blog/aws-lambda-5.png)

Select Next and confirm the function configuration.

![Creating a new function](/img/blog/aws-lambda-6.png)

Now try testing your new Lambda getContacts function.  Select Test and set an empty json object as the payload for the event.

![Test the function](/img/blog/aws-lambda-7.png)

Save and test.

The response from the function call should be.

{% highlight javascript %}
[
  {
    "id": 1,
    "name": "Adam Smith",
    "phone": "555-555-5555",
    "email": "adam.smith@stackleader.com"
  },
  {
    "id": 2,
    "name": "Rebecca Knox",
    "phone": "222-222-2222",
    "email": "rebecca.knox@stackleader.com"
  }
]
{% endhighlight %}

The resulting log output should be as follows.

{% highlight text %}
START RequestId: a3886b24-2457-11e6-9570-8d1a64491f16 Version: $LATEST
2016-05-27T22:09:10.633Z	a3886b24-2457-11e6-9570-8d1a64491f16	Returning all contacts
END RequestId: a3886b24-2457-11e6-9570-8d1a64491f16
REPORT RequestId: a3886b24-2457-11e6-9570-8d1a64491f16	Duration: 0.40 ms	Billed Duration: 100 ms 	Memory Size: 128 MB	Max Memory Used: 37 MB	
{% endhighlight %}

Now test with an id set on the request object.  Select Actions->Configure test event

![Test the function](/img/blog/aws-lambda-8.png)

The response should return one object with the id you specified.  

Now create a second Lambda function called `addContact` with the following code.  All of the configuration should be the same as the last function.

{% highlight text %}
'use strict';
         
/**
 * Creates a new contact.
 */
exports.handler = function(event, context) {
  var name = event.name;
  var phone = event.phone;
  var email = event.email;
  if(name === undefined) {
      context.done(new Error("Missing name value"));
      return;
  }
  var response = {
      id: 1,
      name: name,
      phone: phone,
      email: email
  };
  context.done(null, response);
};
{% endhighlight %}


If both tests work then congratulations on creating your first Lambda functions.  Part 2 of this post will describe how to configure these functions to run synchronously on an API Gateway HTTP request.
