# Specs & Limits (Chunk 3/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/networking/public-networking/specs-and-limits.md
Original Path: docs/networking/public-networking/specs-and-limits.md
Section: docs
Chunk: 3/3

---

## Rate limits

To ensure the integrity and performance of the Railway network, we enforce the following limits for all services.

| Category                    | Limit                         | Description                                               |
| --------------------------- | ----------------------------- | --------------------------------------------------------- |
| **Maximum Connections**     | 10,000 concurrent connections | The number of concurrent connections.                     |
| **HTTP Requests/Sec**       | 11,000~ RPS                   | The number of HTTP requests to a given domain per second. |
| **Requests Per Connection** | 10,000 requests               | The number of requests each connection can make.          |

If your application requires higher limits, please don't hesitate to reach out to us at [team@railway.com](mailto:team@railway.com).

## Traffic types

We currently support HTTP and HTTP2 traffic from the internet to your services.

All traffic must be HTTPS and use TLS 1.2 or above, and TLS SNI is mandatory for requests.

- Plain HTTP GET requests will be redirected to HTTPS with a `301` response.
- Plain HTTP POST requests will be converted to GET requests.

For services that require TCP traffic, like databases, we also have [TCP Proxy](/networking/tcp-proxy) support.

## SSL certificates

We provide LetsEncrypt SSL certificates using RSA 2048bit keys. Certificates are valid for 90 days and are automatically renewed 2 months into their life.

Certificate issuance should happen within an hour of your DNS being updated with the values we provide.

For proxied domains (Cloudflare orange cloud), we may not always be able to issue a certificate for the domain, but Cloudflare to Railway traffic will be encrypted with TLS using the default Railway `*.up.railway.app` certificate.

## Ddos protection

Railway Metal infrastructure is built to mitigate attacks at network layer 4 and below, however we do not provide protection on the application layer. If you need WAF functionality, we recommend using Cloudflare alongside Railway.
