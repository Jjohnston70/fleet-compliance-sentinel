# Troubleshooting SSL (Chunk 3/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/networking/troubleshooting/ssl.md
Original Path: docs/networking/troubleshooting/ssl.md
Section: docs
Chunk: 3/3

---

## Connection issues for some users

If SSL works for most users but not others, the issue is likely on the user's end.

### Why this happens

- Outdated browsers or operating systems that don't support modern TLS
- Corporate firewalls or proxies interfering with connections
- ISP-level filtering or outdated DNS resolvers
- Antivirus software intercepting HTTPS connections

### How to diagnose

Ask affected users to:

1. Try a different browser
2. Try a different network (e.g., mobile data instead of WiFi)
3. Disable antivirus temporarily
4. Check if they're behind a corporate proxy

If the issue only affects users on a specific ISP or network, it's likely a network-level issue outside Railway's control.

### Testing from your side

You can test SSL connectivity using command-line tools:

```bash

# Test SSL connection
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check certificate details
echo | openssl s_client -connect yourdomain.com:443 -servername yourdomain.com 2>/dev/null | openssl x509 -noout -dates
```

## Certificate shows wrong domain

If your browser shows a certificate for `*.up.railway.app` instead of your custom domain, the certificate for your domain hasn't been issued yet.

### Solutions

1. **Check domain status in Railway:** ensure it shows as verified (green checkmark)
2. **Verify DNS configuration:** your CNAME should point to the Railway-provided value
3. **Wait for issuance:** if you just added the domain, wait up to an hour
4. **Check for conflicting records:** ensure you don't have both A and CNAME records for the same hostname

## Using the network diagnostics tool

If you're still having issues, Railway provides a [Network Diagnostics tool](/networking/troubleshooting/network-diagnostics) that can help identify connectivity problems between your location and Railway's infrastructure.

Download and run the tool, then share the results with Railway support if needed.

## When to contact support

Contact Railway support if:

- Certificate issuance has been stuck for more than 72 hours
- You've verified DNS is correct and there are no CAA/DNSSEC issues
- The Network Diagnostics tool shows problems
- You're experiencing issues that this guide doesn't address

You can reach support through [Central Station](https://station.railway.com) by creating a thread in the Questions topic.
