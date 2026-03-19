# Add a CDN using Amazon CloudFront (Chunk 6/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/add-a-cdn-using-cloudfront.md
Original Path: guides/add-a-cdn-using-cloudfront.md
Section: guides
Chunk: 6/6

---

## 3. Connect a custom domain with SSL enabled

Now that the CloudFront distribution is up and running, you may want to connect a custom domain and ensure SSL is enabled.

This step will _quickly_ cover how to generate a SSL certificate in AWS and configure the custom domain in Namecheap and CloudFront.

First generate an SSL certificate -

- In AWS Management Console, navigate to your CloudFront distribution
- Under the General tab, click the `Edit` button
- Under _Custom SSL certificate_, click the _"Request certificate"_ link below the input field. This will take you to AWS Certificate Manager.
- Click the `Next` button to request a public certificate
- Enter your fully qualified domain name, e.g. `www.railway.com`
  - If you'd like the cert to include the apex domain, click `Add another name to this certificate` and enter it, e.g. `railway.com`
- Click the `Next` button to generate the certificate
- In **Namecheap**, in the Advanced DNS section for the domain, add the host record(s).
  - If you set up the certificate for both www and the apex domain, you will add two **CNAME** records
  - The CNAME name value provided by AWS, should be used as the **Host** value in Namecheap.
  - The CNAME name value provided by AWS, includes the domain name, but in Namecheap, you should add everything except the domain, e.g.
    - if your CNAME name is `_6cf3abcd1234abcd1234aabb11cc22.www.railway.com`
    - you should add `_6cf3abcd1234abcd1234aabb11cc22.www` to the **Host** value in Namecheap
- Once you add the DNS records in Namecheap, refresh the Certificate status page in AWS to confirm the Status shows **Success**

Now, add the certificate in the CloudFront distribution settings and finish setting up the custom domain -

- Return the the CloudFront distribution settings
- Under _Custom SSL certificate_, choose the certificate you just created from the drop down menu
- Under _Alternate domain name (CNAME)_, add your custom domain.
  - If you want both www and apex domain, be sure to add both
- At the bottom, click the `Save changes` button
- In **Namecheap**, in the Advanced DNS section for the domain, add the host record(s)
  - If you are setting up both www and the apex domain, you will add two **ALIAS** records
  - The record value should be your Cloudfront distribution domain, e.g. `d1a23bcdefg.cloudfront.net`
  - The **Host** value should be `@` for the apex domain and `www` for the www subdomain.

That's it! You should now be able to navigate to the three routes in the Fastify service from your custom domain.

## Conclusion

Congratulations! You have deployed a Fastify app to Railway, created a CloudFront distribution in AWS connected to the Railway service, and (optionally) connected your custom domain in Namecheap to the CloudFront distribution with SSL enabled.

#### Additional resources

This is a _very_ simple tutorial covering the most basic steps to implement CloudFront CDN in your stack. There are many, many more concepts you should explore related to CDNs and caching in general, to take full advantage of the technology and tailor it to your specific needs.

We recommend checking out these resources to start:

- [What is a CDN?](https://aws.amazon.com/what-is/cdn/)
- [What is caching?](https://www.cloudflare.com/learning/cdn/what-is-caching/)
- [CDN vs Caching](https://www.fastly.com/blog/leveraging-browser-cache-fastlys-cdn/)
