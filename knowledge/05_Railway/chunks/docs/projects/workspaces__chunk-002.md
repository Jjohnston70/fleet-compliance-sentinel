# Workspaces (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/projects/workspaces.md
Original Path: docs/projects/workspaces.md
Section: docs
Chunk: 2/2

---

### Verifying a trusted domain

Before adding a Trusted Domain, you must verify ownership by adding your email domain as a [custom domain](/networking/public-networking#custom-domains) on a Railway service.

You can verify a parent domain using a subdomain. For example, adding `verify.example.com` as a custom domain allows you to add `example.com` as trusted domain.

If you don't already have a service using your domain, you can set up a temporary service to verify your domain:

1. Create a new **empty service** in any project (a temporary new project works fine).
2. **Deploy** the service.
3. Open the service and go to the **Settings** tab.
4. Scroll to **Networking -> Custom Domain**.
5. **Add your email domain** (or a subdomain). Leave the port field empty.
6. Click **Add Domain** and follow the DNS setup instructions. If you use Cloudflare or a similar provider, make sure to **disable the proxy**.
7. Wait until the domain is verified.
8. Go to the [**Trusted Domain settings**](https://railway.com/workspace/people) and add your email domain. Assign the default role for new members.
9. After the domain is verified and added, you can safely remove the temporary service and DNS record.

Additional notes and troubleshooting:

- You can verify a trusted domain by adding a subdomain (e.g., add `verify.example.com` as custom domain and use `example.com` as trusted domain).
- Opening the domain in your browser can speed up verification.
- Trusted Domains are only verified when added. Once verified, the custom domain and its DNS record can be removed safely.

## Transferring projects

Transfer projects from another Workspace or Hobby workspace easily. Detailed instructions can be found [here](/projects#transferring-projects).

## Invoicing and billing

Railway offers a consumption-based pricing model for your projects. You don't get charged for resources you don't use, instead, Railway charges by the minute for each vCPU and memory resource your service uses.

However, if you expect to use a consistent amount of resources for large companies, you can contact us for a quote and demo. Railway will work with you to find a solution that works for your needs. We are willing to offer Purchase Orders and concierge onboarding for large companies.

### Committed spend tiers

Railway offers committed spend tiers for customers with consistent usage needs. Instead of negotiated contract pricing, customers can commit to a specific monthly threshold to [unlock additional features and services.](/pricing/plans#committed-spend-tiers)

Monthly thresholds for addons is found in the [committed spend pricing](/pricing/plans#committed-spend-tiers).

Reach out to us at [team@railway.com](mailto:team@railway.com) for more information.
