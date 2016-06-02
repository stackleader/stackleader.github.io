---
layout: post
title:  "Getting Started with AWS Lambda REST Services Part 2 of 3"
description: "Part 2 of this post will describe how to setup API Gateway to synchronously call Lambda functions."
imageSmall: /img/blog/aws_lambda_small.png
imageLarge: /img/blog/aws_lambda_large.png
date:   2016-06-01 10:00:00 -0400
categories: cloud
tags: [cloud]
---


<!-- MarkdownTOC -->

- [Overview](#overview)
- [Configure API Gateway](#configure-api-gateway)
    - [Resource /contacts Configuration](#resource-contacts-configuration)
    - [Resource /contacts/{id} Configuration](#resource-contactsid-configuration)
    - [GET Method Configuration](#get-method-configuration)
        - [Mapping Templates](#mapping-templates)
    - [POST Method Configuration](#post-method-configuration)

<!-- /MarkdownTOC -->

### Overview
[Part 1](/cloud/2016/05/27/getting-started-aws-lambda-http-part1.html) of this post outlined how to configure the AWS Lambda functions for the HTTP REST service.  For part 2 we will explore how to configure API Gateway to create REST endpoints to fire the Lambda functions created in the previous post. 

### Configure API Gateway
Go to the Gateway API dashboard.

<https://console.aws.amazon.com/apigateway/home>

Select Create API.  If this is your first time using API Gateway you may need to click Get Started.  Select New API and name the API `Contact API`

![Creating a new API](/img/blog/aws-lambda-9.png)

#### Resource /contacts Configuration

Select Actions->Create Resource.  Create a resource with the Resource Name contacts and Resource Path `contacts`

![Creating a new API](/img/blog/aws-lambda-10.png)

#### Resource /contacts/{id} Configuration

Select the new contacts resource and then select Actions->Create Resource.  

![Select contacts resource](/img/blog/aws-lambda-12.png)

Create a resource with the Resource Name id and Resource Path of `{id}`.  The curly braces creates a path variable `id` that will be included in the request.

![Create id resource](/img/blog/aws-lambda-11.png)

#### GET Method Configuration

Select `/contacts` under resources

![Select contacts resource](/img/blog/aws-lambda-13.png)

Select Actions->Create Method and select GET.  Click the check mark to save the new method.

![Select contacts resource](/img/blog/aws-lambda-14.png)

Configure the method to integrate with a Lambda Function, use the Lambda region that you created the function in, and call the Lambda function `getContacts`.  

![Configure method](/img/blog/aws-lambda-15.png)

If you are unsure of the regions then go to the [Lambda console](https://console.aws.amazon.com/lambda/home){:target="_blank"}, select the `getContacts` Lambda function, and look at the ARN.

![FInd ARN](/img/blog/aws-lambda-16.png)

After creating the method, you should now see the flow of the GET request on the `contacts` resource.  Select Test to test the new endpoint.

![Test](/img/blog/aws-lambda-17.png)

The response should return a list containing two contacts.

![Test result](/img/blog/aws-lambda-18.png)

We will come back to this endpoint later in the post to cover security.  Do not worry, the endpoint is not public until you deploy your api.

Select the `{id}` resource and add a GET method.

![id get method](/img/blog/aws-lambda-20.png)

Configure the method with same configuration as before.

![id get method](/img/blog/aws-lambda-19.png)

##### Mapping Templates

Now the path id parameter must be mapped to a json payload for the Lambda function.  Select Integration Request.

![id get method](/img/blog/aws-lambda-21.png)

Change the Body Mapping Templates: Request body passthrough to Never.  This will prevent API gateway request body from being passed through to the Lambda function.

![passthrough settings](/img/blog/aws-lambda-22.png)

Create a new mapping template for Content-Type `application/json`

![mapping template](/img/blog/aws-lambda-23.png)

Create a mapping template that creates a json object for the Lambda function.  The input.params function returns the value of a method request parameter from the path, query string, or header value (in that order). ([see AWS doc](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html#input-variable-reference){:target="_blank"})

{% highlight javascript %}
{
  "id" : $input.params('id')
}
{% endhighlight %}

![mapping template](/img/blog/aws-lambda-25.png)

Save and go back to the Method Execution.  Now you are ready to select Test, add a path id, and select Test again.

![mapping template](/img/blog/aws-lambda-26.png)

If all is well, you should get a response containing one contact with the id you specified.

![mapping template](/img/blog/aws-lambda-27.png)

#### POST Method Configuration

The last method for this API Gateway will add a POST method for the `addContact` lambda function.

Select the `/contacts` resource and create a POST method.

![post method](/img/blog/aws-lambda-28.png)

Configure the POST method to integrate with Lambda functions, use the appropriate region, and call the `addContact` Lambda function.

![post method](/img/blog/aws-lambda-29.png)

This method will require no additional configuration for now.  Test the method with the following request body

{% highlight json %}
{
    "name" : "test",
    "phone" : "555-555-5555"
}
{% endhighlight %}

You should get a similar response

![response](/img/blog/aws-lambda-30.png)

Congratulations!  You have configured API Gateway to synchronously call Lambda functions.  In part 3 of this post we will configure the IAM security policies and deploy the api so that it is publicly accessible.