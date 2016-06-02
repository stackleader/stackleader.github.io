---
layout: post
title:  "Getting Started with AWS Lambda REST Services Part 3 of 3"
description: "Part 3 of this post will describe how to setup security policies and deploy the API."
imageSmall: /img/blog/aws_lambda_small.png
imageLarge: /img/blog/aws_lambda_large.png
date:   2016-06-02 10:00:00 -0400
categories: cloud
tags: [cloud]
---


<!-- MarkdownTOC -->

- [Overview](#overview)
- [Securing API Gateway](#securing-api-gateway)
- [IAM](#iam)
    - [Create Credentials](#create-credentials)
    - [GET Security Policy](#get-security-policy)
    - [POST Security Policy](#post-security-policy)
- [Deploy API](#deploy-api)
- [Test the API](#test-the-api)

<!-- /MarkdownTOC -->

### Overview
[Part 2](/cloud/2016/06/01/getting-started-aws-lambda-http-part2.html) of this post outlined how to configure the AWS API Gateway so that the appropriate REST service could call the Lambda functions created in [part 1](/cloud/2016/05/27/getting-started-aws-lambda-http-part1.html).  Part 3 of this post will detail the IAM configuration and deploying the API so that it is publicly accessible.

### Securing API Gateway
Go to the API Gateway console.

<https://console.aws.amazon.com/apigateway/home>

Select the Contact API created in [part 2](/cloud/2016/06/01/getting-started-aws-lambda-http-part2.html).  Select /contacts->POST.  Record the ARN.

![Record ARN](/img/blog/aws-lambda-33.png)

Select /contacts->GET.  Record the ARN.

![Record ARN](/img/blog/aws-lambda-34.png)

Select /contacts/{id}->GET.  Record the ARN.

![Record ARN](/img/blog/aws-lambda-35.png)

Select /contacts->POST->Method Request.  Change Authorization to AWS_IAM.

![Add IAM to endpoint](/img/blog/aws-lambda-36.png)

Change Authorization to AWS_IAM for endpoints /contacts->GET and /contacts/{id}->GET

### IAM
IAM (Identity and Access Management) is a service in AWS that can create very granular security polices for services in AWS.  We need to create two credentials.  The first will only have access to making GET requests on the `/contacts` and `/contacts/{id}` endpoint.  The second will only have access to POST to `/contacts`.

To get started, go to the IAM console.

<https://console.aws.amazon.com/iam/home>{:target="_blank"}

#### Create Credentials
Go to Users->Create New User. Create two new users: contact-get and contact-post. Leave "Generate an access key for each user" checked.

![Create users](/img/blog/aws-lambda-31.png)

Save both of the credentials sets for later.

![Create users](/img/blog/aws-lambda-32.png)

#### GET Security Policy
Select Users->contacts-get->Inline Policies->"...To create one, click here." to create an inline policy.  Select Policy Generator->Select.  Set Effect to Allow, Service to Amazon API Gateway, Actions to Invoke, and set the Amazon Resource Name to the ARN of /contacts->GET and /contacts/{id}->GET.  These ARNs where recorded in the Securing API Gateway section above.  Separate the two ARNs by a comma e.g. `arn:aws:execute-api:us-east-1:111111241083:aaaaaay4eb/*/GET/contacts, arn:aws:execute-api:us-east-1:111111241083:aaaaaay4eb/*/GET/contacts/*`

Note that these ARNs will be unique to your account.  You must follow the Securing API Gateway section to get this part correct.

Select Add Statement.

![Add IAM to endpoint](/img/blog/aws-lambda-37.png)

Select Next Step->Attach Policy

#### POST Security Policy

Select Users->contacts-post->Inline Policies->"...To create one, click here." to create an inline policy.  Select Policy Generator->Select.  Set Effect to Allow, Service to Amazon API Gateway, Actions to Invoke, and set the Amazon Resource Name to the ARN of /contacts->POST.  This ARN was recorded in the Securing API Gateway section above.

Select Next Step->Attach Policy

### Deploy API
Select Actions->Deploy API.  Set Deployment Stage to [New Stage] and set Stage Name to test.

![Deploy API](/img/blog/aws-lambda-38.png)

Select Deploy.

### Test the API

Under Contact API->Stages->test record the Invoke URL

![Invoke url](/img/blog/aws-lambda-40.png)

Open Postman.  The installation of [Postman](http://www.getpostman.com/){:target="_blank"} is beyond the scope of this post.

Set the method to GET, the URL to the `Invoke URL` copied from above.  If the URL does not end in /contacts, add it e.g. https://111111y4eb.execute-api.us-east-1.amazonaws.com/test/contacts.  Under the Authorization tab set the type to AWS Signature.  Set the accessKey and secretKey to the contacts-get users credentials recorded earlier in the post.  Set the AWS Region to the region that the API Gateway was created in.  The Invoke URL contains this information if you are unsure.  Set the Service Name to `execute-api`.  Select Update Requests and then Send.  The response should contain a list of two contacts.

![Invoke url](/img/blog/aws-lambda-41.png)

In Postman change the method type to Post.  Select Body->raw and set the type to JSON (application/json).  Set the body to:

{% highlight json %}
{
    "name" : "Adam Smith",
    "phone" : "555-555-5555"
}
{% endhighlight %}

Select Send.  You should get a 403 forbidden since the AWS credentials are for `contacts-get` and this user does not have the right to POST.

Under Authorization, update the AccessKey and SecretKey to contacts-post which was recorded earlier in the post.  Select Update Request and Send again.  You should now get a contact in the response.