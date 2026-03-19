# Working with Domains (Chunk 3/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/networking/domains/working-with-domains.md
Original Path: docs/networking/domains/working-with-domains.md
Section: docs
Chunk: 3/5

---

### Adding a root domain

When adding a root or apex domain to your Railway service, you must ensure that you add the appropriate DNS record to the domain within your DNS provider. At this time, Railway supports [CNAME Flattening](https://developers.cloudflare.com/dns/cname-flattening/) and dynamic ALIAS records.

**Additional context**

Generally, direct CNAME records at the root or apex level are incompatible with DNS standards (which assert that you should use an "A" or "AAAA" record). However, given the dynamic nature of the modern web and PaaS providers like Railway, some DNS providers have incorporated workarounds enabling CNAME-like records to be associated with root domains.
_Check out [RFC 1912](https://www.ietf.org/rfc/rfc1912.txt#:~:text=root%20zone%20data).-,2.4%20CNAME%20records,-A%20CNAME%20record) if you're interested in digging into this topic._

**Choosing the correct record type**

The type of record to create is entirely dependent on your DNS provider. Here are some examples -

- [Cloudflare CNAME](https://developers.cloudflare.com/dns/zone-setups/partial-setup) - Simply set up a CNAME record for your root domain in Cloudflare, and they take care of the rest under the hood. Refer to [this guide](https://support.cloudflare.com/hc/en-us/articles/205893698-Configure-Cloudflare-and-Heroku-over-HTTPS) for more detailed instructions.
- [DNSimple ALIAS](https://support.dnsimple.com/articles/domain-apex-heroku/) - Set up a dynamic ALIAS in DNSimple for your root domain.
- [Namecheap CNAME](https://www.namecheap.com/support/knowledgebase/article.aspx/9646/2237/how-to-create-a-cname-record-for-your-domain/) - Set up a CNAME in Namecheap for your root domain.
- [bunny.net](https://bunny.net/blog/how-aname-dns-records-affect-cdn-routing/) - Set up a ANAME in bunny.net for your root domain.

In contrast there are many nameservers that don't support CNAME flattening or dynamic ALIAS records -

- [AWS Route 53](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-register-other-dns-service.html)
- [Hostinger](https://support.hostinger.com/en/articles/1696789-how-to-change-nameservers-at-hostinger)
- [GoDaddy](https://www.godaddy.com/en-ca/help/edit-my-domain-nameservers-664)
- [NameSilo](https://www.namesilo.com/support/v2/articles/domain-manager/dns-manager)
- [Hurricane Electric](https://dns.he.net/)
- [SquareSpace](https://support.squarespace.com/hc/en-us/articles/4404183898125-Nameservers-and-DNSSEC-for-Squarespace-managed-domains#toc-open-the-domain-s-advanced-settings)

**Workaround - Changing your Domain's Nameservers**

If your DNS provider doesn't support CNAME Flattening or dynamic ALIAS records at the root, you can also change your domain's nameservers to point to Cloudflare's nameservers. This will allow you to use a CNAME record for the root domain. Follow the instructions listed on Cloudflare's documentation to [change your nameservers](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/).
