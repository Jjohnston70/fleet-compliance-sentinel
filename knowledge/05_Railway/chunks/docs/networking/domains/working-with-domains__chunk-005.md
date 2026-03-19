# Working with Domains (Chunk 5/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/networking/domains/working-with-domains.md
Original Path: docs/networking/domains/working-with-domains.md
Section: docs
Chunk: 5/5

---

### Cloudflare configuration

If you have proxying enabled on Cloudflare (the orange cloud), you MUST set your SSL/TLS settings to **Full** -- Full (Strict) **will not work as intended**.

If proxying is not enabled, Cloudflare will not associate the domain with your Railway project. In this case, you will encounter the following error message:

```
ERR_TOO_MANY_REDIRECTS
```

Also note that if proxying is enabled, you can NOT use a domain deeper than a first level subdomain without Cloudflare's Advanced Certificate Manager. For example, anything falling under \*.yourdomain.com can be proxied through Cloudflare without issue, however if you have a custom domain under \*.subdomain.yourdomain.com, you MUST disable Cloudflare Proxying and set the CNAME record to DNS Only (the grey cloud), unless you have Cloudflare's Advanced Certificate Manager.

---

## Private domains

Private domains enable service-to-service communication within Railway's [private network](/networking/private-networking). Every service automatically gets an internal DNS name under the `railway.internal` domain.

### How private DNS works

By default, all projects have private networking enabled and services will get a DNS name in the format:

```
.railway.internal
```

For example, if you have a service called `api`, its internal hostname would be `api.railway.internal`.

For new environments (created after October 16, 2025), this DNS name resolves to both internal IPv4 and IPv6 addresses. [Legacy environments](/networking/private-networking#legacy-environments) resolve to IPv6 only.

### Using private domains

To communicate with a service over the private network, use the internal hostname and the port on which the service is listening:

```javascript
// Example: Frontend service calling an API service
app.get("/fetch-data", async (req, res) => {
  axios.get("http://api.railway.internal:3000/data").then(response => {
    res.json(response.data);
  });
});
```

**Note:** Use `http` (not `https`) for internal communication - traffic stays within the private network.

### Using reference variables

You can use [reference variables](/variables#reference-variables) to dynamically reference another service's private domain:

```bash
BACKEND_URL=http://${{api.RAILWAY_PRIVATE_DOMAIN}}:${{api.PORT}}
```

Then in your code:

```javascript
app.get("/fetch-data", async (req, res) => {
  axios.get(`${process.env.BACKEND_URL}/data`).then(response => {
    res.json(response.data);
  });
});
```

### Changing the service name

Within the service settings, you can change the service name which updates the DNS name, e.g., `api-1.railway.internal` → `api-2.railway.internal`.

The root of the domain, `railway.internal`, is static and **cannot** be changed.

### Private domain scope

The private network exists in the context of a project and environment:

- Services in one project/environment **cannot** communicate with services in another project/environment over the private network.
- Client-side requests from browsers **cannot** reach the private network - they must go through a public domain.

For complete information on configuring services for private networking, see the [Private Networking guide](/networking/private-networking).

## Troubleshooting

Having trouble with your domain configuration? Check out the [Troubleshooting guide](/troubleshooting) or reach out on the [Railway Discord](https://discord.gg/railway).
