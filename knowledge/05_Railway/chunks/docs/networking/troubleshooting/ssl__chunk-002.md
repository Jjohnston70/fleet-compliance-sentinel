# Troubleshooting SSL (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/networking/troubleshooting/ssl.md
Original Path: docs/networking/troubleshooting/ssl.md
Section: docs
Chunk: 2/3

---

#### Check for caa records

CAA (Certificate Authority Authorization) records specify which certificate authorities are allowed to issue certificates for your domain. If you have CAA records that don't include Let's Encrypt, certificate issuance will fail.

To check for CAA records:

```bash
dig CAA yourdomain.com
```

If you have CAA records, ensure Let's Encrypt is included:

```
yourdomain.com.  CAA  0 issue "letsencrypt.org"
```

If you don't have any CAA records, this is not your issue. The absence of CAA records allows any CA to issue certificates.

#### Check dnssec configuration

DNSSEC can interfere with certificate validation if misconfigured. To check DNSSEC status:

1. Visit [dnsviz.net](https://dnsviz.net) and enter your domain
2. Look for any errors or warnings in the DNSSEC chain

If DNSSEC is misconfigured, you'll need to either fix the configuration or disable DNSSEC through your domain registrar.

#### Cloudflare-specific issues

If you're using Cloudflare, ensure:

- The DNS record is proxied (orange cloud) for regular domains
- For wildcard domains, the `_acme-challenge` record must NOT be proxied (grey cloud)
- SSL/TLS mode is set to **Full** (not Full Strict)

**The Toggle Trick:** If your certificate is stuck on "Validating Challenges," try temporarily turning the Cloudflare proxy OFF (grey cloud), wait for Railway to issue the certificate (you'll see a green checkmark in Railway), then turn the proxy back ON (orange cloud). This removes Cloudflare from the validation path and allows Railway's Let's Encrypt challenge to reach the origin directly.

See the [Cloudflare SSL Errors](#cloudflare-ssl-errors) section for more details.

## Cloudflare SSL errors

When using Cloudflare with Railway, specific SSL configurations are required. **Use Full mode.** It encrypts all traffic while tolerating the temporary certificate states that occur during Railway's automatic certificate management.

### Err_too_many_redirects

This typically happens when Cloudflare's SSL mode doesn't match Railway's configuration.

**Solution:** Set Cloudflare SSL/TLS mode to **Full**.

If you have SSL mode set to "Flexible", Cloudflare sends unencrypted requests to Railway, but Railway redirects HTTP to HTTPS, causing an infinite redirect loop.

### Error 526: invalid SSL certificate

This error means Cloudflare cannot validate the SSL certificate on Railway's origin server.

**Solution:** Set your Cloudflare SSL/TLS mode to **Full** (not Full Strict).

1. Go to your domain in Cloudflare dashboard
2. Navigate to SSL/TLS > Overview
3. Select **Full**

### Error 525: SSL handshake failed

This error indicates Cloudflare could not complete an SSL handshake with Railway.

**Possible causes:**
- Railway has not yet issued a certificate for your domain
- There's a temporary issue with certificate provisioning

**Solutions:**
1. Wait for certificate issuance to complete (check your domain status in Railway)
2. Ensure your domain's DNS is correctly configured
3. Try toggling proxy off and on in Cloudflare

### Wildcard domain certificate issues

For wildcard domains on Cloudflare:

1. The `_acme-challenge` CNAME record **must not be proxied** (use grey cloud / DNS only)
2. Enable [Universal SSL](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/enable-universal-ssl/) in Cloudflare
3. For nested wildcards (e.g., `*.subdomain.example.com`), you need Cloudflare's Advanced Certificate Manager
