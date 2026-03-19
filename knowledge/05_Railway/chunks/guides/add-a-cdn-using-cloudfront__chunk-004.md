# Add a CDN using Amazon CloudFront (Chunk 4/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/add-a-cdn-using-cloudfront.md
Original Path: guides/add-a-cdn-using-cloudfront.md
Section: guides
Chunk: 4/6

---

## 2. Create a CloudFront distribution in AWS

_This step assumes you have already [configured the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) to connect to your AWS account._

Now create a CloudFront distribution using the AWS CDK.

- In your "fastify" folder, create a new folder called "cloudfront"
- Within the "cloudfront" folder, run the following command to initialize a new CDK project in TypeScript
  ```plaintext
  cdk init app --language typescript
  ```
- Run the following command to install the CDK packages for CloudFront
  ```plaintext
  npm install @aws-cdk/aws-cloudfront @aws-cdk aws-cloudfront-origins @aws-cdk/core
  ```
- Replace the contents of the "/bin/cloudfront.ts" file with the following code.

  _When you run `cdk bootstrap` in the following steps, the account and region environment variables should be added for you._

  ```javascript
  #!/usr/bin/env node
  import "source-map-support/register";

  const app = new cdk.App();
  new CloudfrontCdkStack(app, "CloudfrontCdkStack", {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
  });
  ```

- Replace the contents of the "/lib/cloudfront-stack.ts" file with the following code

  ```javascript

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);

      // Replace with the Domain provided by Railway
      const origin = new origins.HttpOrigin("RAILWAY PROVIDED DOMAIN");

      // Custom Cache Policy
      const cachePolicy = new cloudfront.CachePolicy(
        this,
        "CustomCachePolicy",
        {
          cachePolicyName: "CustomCachePolicy",
          minTtl: cdk.Duration.seconds(0),
          maxTtl: cdk.Duration.seconds(86400),
          defaultTtl: cdk.Duration.seconds(60),
          cookieBehavior: cloudfront.CacheCookieBehavior.all(),
          queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
          headerBehavior: cloudfront.CacheHeaderBehavior.allowList(
            "CloudFront-Viewer-Country",
            "CloudFront-Is-Mobile-Viewer",
          ),
        },
      );

      // CloudFront distribution
      const distribution = new cloudfront.Distribution(this, "Distribution", {
        defaultBehavior: {
          origin,
          cachePolicy: cachePolicy,
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        },
      });
    }
  }
  ```

  **IMPORTANT: Be sure to replace the `HttpOrigin` in the code above with the Railway-provided domain (e.g. _fastify-server.up.railway.app_)**

- Run the following command to bootstrap the environment for the CDK
  ```plaintext
  cdk bootstrap
  ```
- Run the following command to deploy the CloudFront distribution
  ```plaintext
  cdk deploy
  ```

_If you experience any problems with the AWS utilities used in this step, you can create and configure the CloudFront distribution manually using the AWS Management Console, using the same settings defined in the "cloudfront-stack.ts" file._
