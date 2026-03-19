# Deploy Static Sites with Zero Configuration and Custom Domains (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/static-hosting.md
Original Path: guides/static-hosting.md
Section: guides
Chunk: 1/3

---

# Deploy Static Sites with Zero Configuration and Custom Domains

Learn how to deploy static websites to Railway with automatic GitHub builds, SSL certificates, custom domains, and integrate with a CDN. Perfect for marketing sites, blogs, and documentation.

In this guide, you'll learn how to deploy static websites to Railway with automatic GitHub builds, SSL certificates, and custom domains. All with zero configuration required.

## What is Railway?

Railway is a modern deployment platform that lets you deploy static websites and applications without managing servers, configuring load balancers, or learning complex infrastructure. It provides automatic builds, zero-downtime deployments, and built-in CI/CD.

Learn more about Railway's [core components and foundations](/overview/the-basics).

## Why choose Railway for static hosting?

Railway offers several advantages for static site hosting:

- Zero configuration: Deploy from GitHub without build scripts or complex setup.
- Automatic builds: Every push triggers a new deployment automatically.
- Custom domains: Automatically provisioned SSL certificates and custom domain setup.
- Preview environments: Test changes with automatic PR previews.
- Usage-based pricing: Pay only for what you use, starting at $5/month.
- Private repositories: Deploy from private GitHub repos without additional cost.

## Prerequisites

This is a beginner-friendly guide. You'll need:

- A Railway account
- [Git](https://git-scm.com/) configured and a [GitHub](https://github.com/) account

## Deploy a static site on Railway from your own GitHub repository

1. Go to [railway.com/new](https://railway.com/new)
2. Select "Deploy from GitHub repo"
3. Connect your GitHub account and choose your repository
4. Railway will automatically detect the build configuration and deploy your site

## Configure a custom domain

Custom domains can be added to any Railway service with automatic SSL certificate provisioning.

1. Navigate to your service settings:
   - In your Railway project, click on your deployed service
   - Go to the "Settings" tab
   - Scroll to the "Networking" section

2. Add your domain:
   - Click the "+ Custom Domain" button
   - Enter your domain (e.g., `example.com`) and specify the target port
   - Railway will provide you with a CNAME record to configure in your DNS provider

![Add a Custom Domain](https://res.cloudinary.com/railway/image/upload/v1758569589/CleanShot_2025-09-22_at_22.32.05_2x_io3eqe.png)

3. Configure DNS:
   - In your DNS provider (Cloudflare, Namecheap, etc.), create a CNAME record
   - Point your domain to the Railway-provided CNAME
   - Wait for verification (usually takes a few minutes but can take up to 72 hours)

4. SSL Certificate:
   - Railway automatically issues and renews SSL certificates
   - Your site will be available at `https://your-domain.com`

Learn more about [custom domains](/networking/public-networking#custom-domains) and [SSL configuration](/networking/public-networking#ssl-certificates) in Railway.
