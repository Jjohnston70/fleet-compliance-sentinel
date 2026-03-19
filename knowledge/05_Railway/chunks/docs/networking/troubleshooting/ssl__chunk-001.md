# Troubleshooting SSL (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/networking/troubleshooting/ssl.md
Original Path: docs/networking/troubleshooting/ssl.md
Section: docs
Chunk: 1/3

---

# Troubleshooting SSL

Learn how to diagnose and fix common SSL certificate issues on Railway.

Railway automatically provisions free SSL certificates via Let's Encrypt for all domains. Most of the time this works seamlessly, but occasionally issues can arise. This guide helps you diagnose and resolve common SSL problems.

## How Railway SSL works

When you add a domain to your service, Railway automatically:

1. Initiates a certificate request with Let's Encrypt
2. Completes domain validation challenges
3. Issues and installs the certificate
4. Renews certificates automatically when 30 days of validity remain (certificates are valid for 90 days)

Certificate issuance typically completes within an hour, though it can take up to 72 hours in some cases.

## Quick reference

| Symptom | Section |
|---------|---------|
| Certificate stuck on "Validating Challenges" | [Certificate Stuck on "Validating Challenges"](#certificate-stuck-on-validating-challenges) |
| ERR_TOO_MANY_REDIRECTS | [Cloudflare SSL Errors](#err_too_many_redirects) |
| Error 526: Invalid SSL Certificate | [Cloudflare SSL Errors](#error-526-invalid-ssl-certificate) |
| Error 525: SSL Handshake Failed | [Cloudflare SSL Errors](#error-525-ssl-handshake-failed) |
| SSL works for some users but not others | [Connection Issues for Some Users](#connection-issues-for-some-users) |
| Certificate shows `*.up.railway.app` | [Certificate Shows Wrong Domain](#certificate-shows-wrong-domain) |

## Before you troubleshoot

Many SSL issues are actually browser cache issues. Before diving into troubleshooting, try these steps first:

1. **Verify your service is deployed and running:** a stopped service cannot respond to certificate validation challenges
2. **Clear your browser cache** or test in an incognito/private window
3. **Flush your local DNS cache:**
   - macOS: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
   - Windows: `ipconfig /flushdns`
   - Linux: `sudo resolvectl flush-caches` (or `sudo systemd-resolve --flush-caches` on older systems)
4. **Test from a different device or network** to rule out local issues
5. **Wait at least an hour** after adding a domain before investigating

If the issue persists after these steps, continue with the troubleshooting sections below.

## Certificate stuck on "validating challenges"

If your domain shows that the Certificate Authority is validating challenges for an extended period, the certificate issuance process is not completing successfully.

### Why this happens

- DNS records have not propagated yet
- DNS records are incorrect
- CAA records are blocking Let's Encrypt
- DNSSEC is misconfigured
- Cloudflare proxy settings are interfering

### Solutions

#### Check DNS propagation

Verify your DNS records have propagated using a tool like [dnschecker.org](https://dnschecker.org). Enter your domain and check that the CNAME record points to your Railway-provided value (e.g., `abc123.up.railway.app`).

**Note:** If you are using Cloudflare Proxy (orange cloud), DNS lookup tools will show Cloudflare IP addresses instead of the Railway CNAME. This is expected behavior. In this case, verify your DNS settings directly in your Cloudflare dashboard instead.

DNS changes can take up to 72 hours to propagate worldwide, though most propagate within a few hours.
