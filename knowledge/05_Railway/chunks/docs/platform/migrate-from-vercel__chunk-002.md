# Migrate from Vercel to Railway (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/migrate-from-vercel.md
Original Path: docs/platform/migrate-from-vercel.md
Section: docs
Chunk: 2/2

---

### Deployment verification

Before finalizing your migration:

1. Check your application's core functionality

2. Verify environment variables are properly set

3. Test dynamic routes and API endpoints

4. Confirm image optimization is working

5. Monitor build and runtime logs

Railway's integrated observability helps you catch any issues early in the migration process.

### Local development

Railway makes local development seamless with your production environment:

1. Install the Railway CLI: `npm i -g @railway/cli`

2. Run `railway link` to connect to your project

3. Use `railway run` to start your app locally with production variables

This ensures development/production parity and helps catch issues before they reach production.

That's all it takes to move your Next.js application to Railway! Need help? The [team and community](https://station.railway.com/) are always ready to assist.

Need more information on how we compare to Vercel? Check out the [comparison page](/platform/compare-to-vercel).
