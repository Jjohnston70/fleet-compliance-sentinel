# Specs & Limits (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/networking/public-networking/specs-and-limits.md
Original Path: docs/networking/public-networking/specs-and-limits.md
Section: docs
Chunk: 2/3

---

| Category                 | Key Information                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DNS/Domain Names**     | - Support for domains, subdomains, and wildcard domains.- Subdomains and wildcards cannot overlap (`foo.hello.com` cannot exist with `*.hello.com` unless owned by the same service).- Root domains need a DNS provider with ALIAS records or CNAME flattening.- Unicode domains should be PUNYcode encoded.- Non-public/internal domain names are not supported.                                                          |
| **Certificate Issuance** | - Railway attempts to issue a certificate for **up to 72 hours** after domain creation before failing.- Certificates are expected to be issued within an hour.                                                                                                                                                                                                                                                                            |
| **TLS**                  | - Support for TLS 1.2 and TLS 1.3 with specific cipher sets.- Certificates are valid for 90 days and renewed when 30 days of validity remain.                                                                                                                                                                                                                                                                                                               |
| **Edge Traffic**         | - Support for HTTP/1.1.- Support for websockets over HTTP/1.1.- Proxy Keep-Alive timeout of 60 seconds (1 minute).- Max 32 KB Combined Header Size- Max duration of 15 minutes for HTTP requests.                                                                                                                                                                                                                          |
| **Request Headers**      | - `X-Real-IP` for identifying client's remote IP.- `X-Forwarded-Proto` always indicates `https`.- `X-Forwarded-Host` for identifying the original host header.- `X-Railway-Edge` for identifying the edge region that handled the request.- `X-Request-Start` for identifying the time the request was received (Unix milliseconds timestamp).- `X-Railway-Request-Id` for correlating requests against network logs. |
| **Requests**             | - Inbound traffic must be TLS-encrypted- HTTP GET requests to port 80 are redirected to HTTPS.- HTTP POST requests to port 80 are redirected to HTTPS as GET requests.- SNI is required for correct certificate matching.

|
