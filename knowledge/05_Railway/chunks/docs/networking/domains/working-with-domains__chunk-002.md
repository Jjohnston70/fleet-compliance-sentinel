# Working with Domains (Chunk 2/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/networking/domains/working-with-domains.md
Original Path: docs/networking/domains/working-with-domains.md
Section: docs
Chunk: 2/5

---

#### Subdomains

E.g. `*.example.com`

- Make sure [Universal SSL is enabled](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/enable-universal-ssl/).

- Enable [Full SSL/TLS encryption](https://developers.cloudflare.com/ssl/troubleshooting/too-many-redirects/#full-or-full-strict-encryption-mode).

- Add CNAME records for the wildcard subdomain.

#### Nested subdomains

E.g. `*.nested.example.com`

- [Disable Universal SSL](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/disable-universal-ssl/).

- Purchase Cloudflare's [Advanced Certificate Manager](https://developers.cloudflare.com/ssl/edge-certificates/advanced-certificate-manager/).

- Enable [Edge Certificates](https://developers.cloudflare.com/ssl/edge-certificates/).

- Enable [Full SSL/TLS encryption](https://developers.cloudflare.com/ssl/troubleshooting/too-many-redirects/#full-or-full-strict-encryption-mode).

- Add CNAME records for the wildcard nested subdomain.

When you add a wildcard domain, you will be provided with two domains for which you should add two CNAME records -

One record is for the wildcard domain, and one for the \_acme-challenge. The \_acme-challenge CNAME is required for Railway to issue the SSL Certificate for your domain.

#### Wildcard domains on Cloudflare

If you have a wildcard domain on Cloudflare, you must:

- Turn off Cloudflare proxying on the `_acme-challenge` record (disable the orange cloud)

- Enable Cloudflare's [Universal SSL](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/enable-universal-ssl/)

### Target ports

Target Ports, or Magic Ports, correlate a single domain to a specific internal port that the application listens on, enabling you to expose multiple HTTP ports through the use of multiple domains.

Example -

`https://example.com/` → `:8080`

`https://management.example.com/` → `:9000`

When you first generate a Railway-provided domain, if your application listens on a single port, Railway's magic automatically detects and sets it as the domain's target port. If your app listens on multiple ports, you're provided with a list to choose from.

When you add a custom domain, you're given a list of ports to choose from, and the selected port will handle all traffic routed to the domain. You can also specify a custom port if needed.

These target ports inform Railway which public domain corresponds to each internal port, ensuring that traffic from a specific domain is correctly routed to your application.

You can change the automatically detected or manually set port at any time by clicking the edit icon next to the domain.
