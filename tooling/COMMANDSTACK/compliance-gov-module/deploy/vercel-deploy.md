# Deploying Frontend to Vercel

This guide covers deploying the Next.js frontend to Vercel for production.

## Prerequisites

- Vercel account (https://vercel.com)
- Vercel CLI installed: `npm install -g vercel`
- Backend API deployed and accessible (see cloud-run-deploy.sh)

## Deployment Steps

### 1. Link Repository to Vercel

```bash
cd frontend
vercel link
```

Follow prompts to:
- Connect your GitHub/GitLab/Bitbucket account
- Select your project
- Confirm project settings

### 2. Configure Environment Variables

```bash
vercel env pull
```

This creates a `.env.local` file with production environment variables.

Edit `.env.local` and set:

```
NEXT_PUBLIC_API_URL=https://compliance-gov-api-<deployment>.run.app
```

### 3. Deploy to Production

```bash
vercel --prod
```

Or deploy from GitHub by pushing to main branch (recommended).

### 4. Configure Custom Domain (Optional)

```bash
vercel domains add your-domain.com
```

Follow DNS configuration instructions from Vercel dashboard.

## Automatic Deployment

To enable automatic deployments from GitHub:

1. Push your code to GitHub
2. Connect repository in Vercel dashboard
3. Set production branch to `main`
4. Environment variables auto-deploy from `.env.local`

Pushes to `main` automatically trigger production deployments.

## Monitoring

View deployment logs and metrics:

```bash
vercel logs
```

Or use Vercel Dashboard: https://vercel.com/dashboard

## Rollback

To roll back to previous deployment:

```bash
vercel rollback
```

Or use Vercel Dashboard -> Deployments -> Roll back

## Environment Variables

Available environment variables for frontend:

- `NEXT_PUBLIC_API_URL`: Backend API base URL (must be public/accessible from browser)
- `NEXT_PUBLIC_ANALYTICS_ID`: Analytics provider ID (optional)

Note: Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.
Keep sensitive tokens in server-side environment variables only.

## Troubleshooting

### Build Fails with "Out of Memory"

Increase Vercel's build memory:

1. Go to Project Settings → Build & Development Settings
2. Set Node.js version to LTS
3. Clear build cache and redeploy

### API Connection Issues

1. Verify backend API URL in environment variables
2. Check backend API health: `curl https://<api-url>/health`
3. Verify CORS headers from backend allow frontend origin
4. Check browser console for CORS errors

### Large Bundle Size

Run build analysis:

```bash
npm run build -- --analyze
```

Identify large dependencies and consider alternatives.

## Performance Optimization

### Enable Automatic Image Optimization

Next.js automatic image optimization is enabled by default on Vercel.

### Monitor Core Web Vitals

Vercel automatically tracks Core Web Vitals in Analytics.

View in Vercel Dashboard → Analytics

### Cache Strategy

- Static pages: Cached indefinitely
- API routes: Cache control set per route
- ISR (Incremental Static Regeneration): 1 hour default

## Support

For Vercel-specific issues:
- Vercel Docs: https://vercel.com/docs
- Support: https://vercel.com/support
- Community: https://github.com/vercel/next.js/discussions
