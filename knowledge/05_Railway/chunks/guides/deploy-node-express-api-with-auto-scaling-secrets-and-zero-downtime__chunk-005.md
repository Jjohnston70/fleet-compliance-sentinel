# Deploy Node.js & Express API with Autoscaling, Secrets, and Zero Downtime (Chunk 5/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/deploy-node-express-api-with-auto-scaling-secrets-and-zero-downtime.md
Original Path: guides/deploy-node-express-api-with-auto-scaling-secrets-and-zero-downtime.md
Section: guides
Chunk: 5/6

---

### Configure healthcheck in Railway

1. **Go to your service settings**:
   - In your Railway project, click on your deployed service
   - Navigate to the "Settings" tab

2. **Configure the healthcheck**:
   - Scroll down to the "Healthcheck" section
   - Set the **Healthcheck Path** to `/health`

![Healthchecks](https://res.cloudinary.com/railway/image/upload/v1758247840/docs/healthchecks_dx1ipr.png)

With the healthcheck configured, Railway will:
- Check your application's health before routing traffic to new deployments
- Automatically rollback if the healthcheck fails
- Ensure zero-downtime deployments by only switching traffic when the new version is healthy

Learn more about [configuring healthchecks](/deployments/healthchecks) in Railway.

## Set up preview environments

Railway can spin up temporary environments for every pull request. First, you need to enable PR environments. Learn more about [GitHub Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests):

1. Go to your Project Settings → Environments tab
2. Enable "PR Environments"
3. Optionally enable "Bot PR Environments" for automated PRs from [Dependabot](https://docs.github.com/en/code-security/dependabot) or [Renovatebot](https://renovatebot.com/)

![PR Environments](https://res.cloudinary.com/railway/image/upload/v1758274258/docs/PR_environmetns_q4z0yy.png)

Once enabled, create a feature branch to test this:

```bash
git checkout -b feature/new-endpoint
```

Add a new endpoint to your TypeScript application by updating `src/app.ts`:

```typescript
// Add this route before app.listen()
app.get('/api/status', (req, res) => {
  res.json({
    status: 'Preview environment is working!',
    timestamp: new Date().toISOString(),
    appName: process.env.APP_NAME || 'My Express API',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0-preview'
  });
});
```

Push the changes and create a pull request:

```bash
git add .
git commit -m "Add GET /api/status endpoint"
git push origin feature/new-endpoint
```

Railway will automatically create a temporary environment for your pull request, giving you a unique URL to test your changes. The environment is automatically deleted when the PR is merged or closed.

**Note**: Railway will only deploy PR branches from team members or users invited to your project. For automatic domain provisioning, ensure your base environment services use Railway-provided domains.

Learn more about [using environments](/environments) and [PR environments](/environments#enable-pr-environments) in the Railway documentation.
