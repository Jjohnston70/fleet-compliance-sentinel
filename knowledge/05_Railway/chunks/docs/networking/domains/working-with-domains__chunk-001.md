# Working with Domains (Chunk 1/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/networking/domains/working-with-domains.md
Original Path: docs/networking/domains/working-with-domains.md
Section: docs
Chunk: 1/5

---

# Working with Domains

Learn how to configure public and private domains for your Railway services.

Railway provides two types of domain resolution for your services: **public domains** for internet access and **private domains** for internal service-to-service communication.

## Public domains

Public domains expose your services to the internet. Railway offers two options:

- **Railway-provided domains** - Auto-generated `*.up.railway.app` domains for quick setup
- **Custom domains** - Bring your own domain with automatic SSL certificate provisioning

### Railway-provided domains

Railway services don't obtain a domain automatically, but it is easy to set one up.

To assign a domain to your service, go to your service's settings, find the Networking -> Public Networking section, and choose `Generate Domain`.

#### Automated prompt

If Railway detects that a deployed service is listening correctly, you will see a prompt on the service tile in the canvas, and within the service panel.

Simply follow the prompts to generate a domain and your app will be exposed to the internet.

**Don't see the Generate Domain Button?**

If you have previously assigned a TCP Proxy to your service, you will not see the `Generate Domain` option. You must remove the TCP Proxy (click the Trashcan icon), then you can add a domain.

### Custom domains

Custom domains can be added to a Railway service and once setup we will automatically issue an SSL certificate for you.

1. Navigate to the [Settings tab](/overview/the-basics#service-settings) of your desired [service](/overview/the-basics#services).

2. Click `+ Custom Domain` in the Public Networking section of Settings

3. Type in the custom domain (wildcard domains are supported, [see below](#wildcard-domains) for more details)

   You will be provided with a CNAME domain to use, e.g., `g05ns7.up.railway.app`.

4. In your DNS provider (Cloudflare, DNSimple, Namecheap, etc), create a CNAME record with the CNAME value provided by Railway.

5. Wait for Railway to verify your domain. When verified, you will see a green check mark next to the domain(s) -

   You will also see a `Cloudflare proxy detected` message if we have detected that you are using Cloudflare.

   **Note:** Changes to DNS settings may take up to 72 hours to propagate worldwide.

#### Important considerations

- Freenom domains are not allowed and not supported.
- The Trial Plan is limited to 1 custom domain. It is therefore not possible to use both `yourdomain.com` and `www.yourdomain.com` as these are considered two distinct custom domains.
- The [Hobby Plan](/pricing/plans) is limited to 2 custom domains per service.
- The [Pro Plan](/pricing/plans) is limited to 20 domains per service by default. This limit can be increased for Pro users on request, simply reach out to us via a [private thread](/platform/support#private-threads).

### Wildcard domains

Wildcard domains allow for flexible subdomain management. There are a few important things to know when using them -

- Ensure that the CNAME record for `authorize.railwaydns.net` is not proxied by your provider (eg: Cloudflare). This is required for the verification process to work.

- Wildcards cannot be nested (e.g., \*.\*.yourdomain.com).

- Wildcards can be used for any subdomain level (e.g., `*.example.com` or `*.subdomain.example.com`).
