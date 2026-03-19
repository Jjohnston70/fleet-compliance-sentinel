# Working with Domains (Chunk 4/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/networking/domains/working-with-domains.md
Original Path: docs/networking/domains/working-with-domains.md
Section: docs
Chunk: 4/5

---

### Adding a root domain with www subdomain to Cloudflare

If you want to add your root domain (e.g., `mydomain.com`) and the `www.` subdomain to Cloudflare and redirect all `www.` traffic to the root domain:

1. Create a Custom Domain in Railway for your root domain (e.g., `mydomain.com`). Copy the `value` field. This will be in the form: `abc123.up.railway.app`.
2. Add a `CNAME` DNS record to Cloudflare:
   - `Name` → `@`.
   - `Target` → the `value` field from Railway.
   - `Proxy status` → `on`, should display an orange cloud.
   - Note: Due to domain flattening, `Name` will automatically update to your root domain (e.g., `mydomain.com`).
3. Add another `CNAME` DNS record to Cloudflare:
   - `Name` → `www`.
   - `Target` → `@`
   - `Proxy status:` → on, should display an orange cloud.
   - Note: Cloudflare will automatically change the `Target` value to your root domain.
4. Enable Full SSL/TLS encryption in Cloudflare:
   - Go to your domain on Cloudflare.
   - Navigate to `SSL/TLS -> Overview`.
   - Select `Full`. **Not** `Full (Strict)` **Strict mode will not work as intended**.
5. Enable Universal SSL in Cloudflare:
   - Go to your domain on Cloudflare.
   - Navigate to `SSL/TLS -> Edge Certificates`.
   - Enable `Universal SSL`.
6. After doing this, you should see `Cloudflare proxy detected` on your Custom Domain in Railway with a green cloud.
7. Create a Bulk Redirect in Cloudflare:
   - Go to your [Cloudflare dashboard](https://dash.cloudflare.com/).
   - Navigate to `Bulk Redirects`.
   - Click `Create Bulk Redirect List`.
   - Give it a name, e.g., `www-redirect`.
   - Click `Or, manually add URL redirects`.
   - Add a `Source URL`: `https://www.mydomain.com`.
   - Add `Target URL`: `https://mydomain.com` with status `301`.
   - Tick all the parameter options: (`Preserve query string`, `Include subdomains`, `Subpath matching`, `Preserve path suffix`)
   - Click `Next`, then `Save and Deploy`.

**Note:** DNS changes may take some time to propagate. You may want to refresh your DNS cache by using commands like `ipconfig /flushdns` on Windows or `dscacheutil -flushcache` on macOS. Testing the URLs in an incognito window can also help verify changes.

### SSL certificates

Once a custom domain has been correctly configured, Railway will automatically generate and apply a Let's Encrypt certificate. This means that any custom domain on Railway will automatically be accessible via `https://`.

We provide LetsEncrypt SSL certificates using RSA 2048bit keys. Certificates are valid for 90 days and are automatically renewed when 30 days of validity remain.

Certificate issuance should happen within an hour of your DNS being updated with the values we provide.

For proxied domains (Cloudflare orange cloud), we may not always be able to issue a certificate for the domain, but Cloudflare to Railway traffic will be encrypted with TLS using the default Railway `*.up.railway.app` certificate.

#### External SSL certificates

We currently do not support external SSL certificates since we provision one for you.
