# Deploy Static Sites with Zero Configuration and Custom Domains (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/static-hosting.md
Original Path: guides/static-hosting.md
Section: guides
Chunk: 2/3

---

## Set up preview environments for every pull request for your static site

Railway can automatically create preview environments for every pull request, letting you test changes before merging.

1. Configure project settings:
   - Go to your Project Settings → Environments tab
   - Click "Enable PR Environments"

![PR Environments](https://res.cloudinary.com/railway/image/upload/v1758274258/docs/PR_environmetns_q4z0yy.png)

2. Create a feature branch:
   ```bash
   git checkout -b feature/new-page
   # Make your changes
   git add .
   git commit -m "Add new page"
   git push origin feature/new-page
   ```

3. Create a pull request:
   - Once you create a pull request, Railway will automatically deploy a preview environment with a unique URL where you can preview your changes.
   - When the PR is merged or closed, the PR environment is automatically deleted.

Learn more about [using environments](/environments) and [PR environments](/environments#enable-pr-environments).

## Deploy replicas in different regions for global performance

Railway enables you to deploy your static site across multiple regions for improved global performance and availability.

- Reduced latency: Serve content from the region closest to your users
- High availability: If one region experiences issues, traffic automatically routes to healthy regions
- Better performance: Faster loading times for users worldwide
- Automatic failover: Seamless traffic routing without manual intervention

To get started:

1. In your Railway project, click on your deployed service
2. Go to the "Settings" tab
3. Under "Deploy", go to the "Regions" section and click "+ Add Region"

Railway automatically distributes replicas across available regions and routes traffic to the nearest region.

![Multi-region deployment](https://res.cloudinary.com/railway/image/upload/v1758247839/docs/multi-region_deployment_h5fxqz.png)

Each replica runs with the full resource limits of your plan. So if you're on the Pro plan and deploy 3 replicas, you'll get a combined capacity of 72 vCPU and 72 GB RAM across all regions.

```
Total resources = number of replicas × maximum compute allocation per replica
```

Learn more about [scaling applications](/deployments/scaling) and [multi-region deployments](/platform/compare-to-vps#multi-region-deployment) in Railway.

Alternatively, you can integrate a CDN like Cloudflare for global content delivery and improved performance.

## Add Cloudflare as a CDN

While Railway doesn't currently provide a built-in CDN, you can easily integrate a CDN like [Cloudflare](https://www.cloudflare.com/) for global content delivery and improved performance.

1. Add your domain to Cloudflare:
   - Sign up for a free Cloudflare account
   - Add your Railway domain to Cloudflare
   - Update your nameservers as instructed

2. Configure DNS:
   - Create a CNAME record in Cloudflare
   - Point your domain to your Railway service URL
   - Enable "Proxy" (orange cloud) for CDN benefits

3. Verify setup:
   - Test your domain to ensure it's working correctly
   - Monitor performance improvements in Cloudflare's dashboard
