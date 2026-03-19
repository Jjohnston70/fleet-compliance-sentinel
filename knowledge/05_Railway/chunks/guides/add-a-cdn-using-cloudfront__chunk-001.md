# Add a CDN using Amazon CloudFront (Chunk 1/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/add-a-cdn-using-cloudfront.md
Original Path: guides/add-a-cdn-using-cloudfront.md
Section: guides
Chunk: 1/6

---

# Add a CDN using Amazon CloudFront

Learn how to integrate Amazon CloudFront as a CDN for your Fastify app in this step-by-step guide.

## What is the purpose of a CDN?

> A CDN improves efficiency [of web applications] by introducing intermedeiary servers between the client and the server. [These CDN servers] decrease web traffic to the web server, reduce bandwidth consumption, and improve the user experience of your applications.

_Source: [What is a CDN?](https://aws.amazon.com/what-is/cdn/)_

## About this tutorial

We know that performance of your web applications is critical to your business, and one way to achieve higher performance is by implementing a CDN to serve data from servers closest to your users.

Many CDN options are available ([list from G2](https://www.g2.com/categories/content-delivery-network-cdn)), but this tutorial covers step-by-step how to implement a CDN using [Amazon CloudFront](https://aws.amazon.com/cloudfront/).

**Objectives**

In this tutorial, you will learn how to -

- Deploy a simple [Fastify server](https://fastify.dev/) to Railway
- Create a [CloudFront distribution](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html) in AWS and connect it to the Fastify server
- _(Optional)_ Setup SSL and DNS for a custom domain managed in [Namecheap](https://www.namecheap.com/)

**Prerequisites**

To be successful using this tutorial, you should already have -

- Latest version of the Railway [CLI installed](/cli#installing-the-cli)
- An [AWS account](https://aws.amazon.com/) with permissions to create new resources
- Latest version of the [AWS CLI](https://aws.amazon.com/cli/) installed and authenticated to your AWS account
- Latest version of the [AWS CDK](https://aws.amazon.com/cdk/) installed
- _(Optional)_ A Namecheap account to connect a custom domain

**Let's get started!**
