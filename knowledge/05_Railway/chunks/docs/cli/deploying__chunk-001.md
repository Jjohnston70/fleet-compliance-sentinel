# Deploying with the CLI (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/cli/deploying.md
Original Path: docs/cli/deploying.md
Section: docs
Chunk: 1/2

---

# Deploying with the CLI

Learn how to deploy your applications to Railway using the CLI.

The Railway CLI provides deployment capabilities for both local development workflows and automated CI/CD pipelines.

## Quick deploy

The simplest way to deploy is with `railway up`:

```bash

# Link to your project first (if not already linked)
railway link

# Deploy the current directory
railway up
```

This command scans, compresses, and uploads your app's files to Railway. You'll see real-time deployment logs in your terminal.

Railway will build your code using [Railpack](/builds/railpack) or your [Dockerfile](/builds/dockerfiles), then deploy it.

## Deployment modes

### Attached mode (default)

By default, `railway up` streams build and deployment logs to your terminal:

```bash
railway up
```

This is useful for watching the build process and catching errors immediately.

### Detached mode

Use `-d` or `--detach` to return immediately after uploading:

```bash
railway up -d
```

The deployment continues in the background. Check status in the dashboard or with `railway logs`.

### CI mode

Use `-c` or `--ci` to stream only build logs and exit when the build completes:

```bash
railway up --ci
```

This is ideal for CI/CD pipelines where you want to see the build output but don't need to wait for deployment logs. Use `--json` to output logs in JSON format (also implies CI mode).

## Targeting services and environments

### Deploy to a specific service

If your project has multiple services, the CLI will prompt you to choose. You can also specify directly:

```bash
railway up --service my-api
```

### Deploy to a specific environment

```bash
railway up --environment staging
```

### Deploy to a specific project

Use `-p` or `--project` to deploy to a project without linking:

```bash
railway up --project  --environment production
```

**Note:** When using `--project`, the `--environment` flag is required.

## CI/CD integration

### Using project tokens

For automated deployments, use a [Project Token](/integrations/api#project-token) instead of interactive login. Project tokens are scoped to a specific environment and can only perform deployment-related actions.

```bash
RAILWAY_TOKEN=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX railway up
```

Some actions you can perform with a project token:
- Deploying code - `railway up`
- Redeploying a deployment - `railway redeploy`
- Viewing build and deployment logs - `railway logs`

### GitHub actions

Railway makes deployment status available to GitHub, so you can trigger actions after deployments complete.

#### Post-deployment actions

Use the `deployment_status` event to run commands after Railway deploys your app:

```yaml
name: Post-Deployment Actions

on:
  deployment_status:
    states: [success]

jobs:
  post-deploy:
    runs-on: ubuntu-latest
    if: github.event.deployment_status.state == 'success'
    steps:
      - name: Run post-deploy actions
        if: github.event.deployment.environment == 'production'
        run: |
          echo "Production deployment succeeded"
          # Add your post-deploy commands here
```

See the [GitHub Actions Post-Deploy guide](/guides/github-actions-post-deploy) for more details.
