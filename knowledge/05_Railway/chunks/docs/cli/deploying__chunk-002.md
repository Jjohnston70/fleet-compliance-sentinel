# Deploying with the CLI (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/cli/deploying.md
Original Path: docs/cli/deploying.md
Section: docs
Chunk: 2/2

---

#### PR environments with GitHub actions

Create Railway environments automatically for pull requests:

```yaml
name: Manage PR environments (Railway)

on:
  pull_request:
    types: [opened, closed]

env:
  RAILWAY_API_TOKEN: ${{ secrets.RAILWAY_API_TOKEN }}
  LINK_PROJECT_ID: "your-project-id"
  DUPLICATE_FROM_ID: "environment-to-duplicate"

jobs:
  pr_opened:
    if: github.event.action == 'opened'
    runs-on: ubuntu-latest
    container: ghcr.io/railwayapp/cli:latest
    steps:
      - name: Link to project
        run: railway link --project ${{ env.LINK_PROJECT_ID }} --environment ${{ env.DUPLICATE_FROM_ID }}
      - name: Create Railway Environment for PR
        run: railway environment new pr-${{ github.event.pull_request.number }} --copy ${{ env.DUPLICATE_FROM_ID }}

  pr_closed:
    if: github.event.action == 'closed'
    runs-on: ubuntu-latest
    container: ghcr.io/railwayapp/cli:latest
    steps:
      - name: Link to project
        run: railway link --project ${{ env.LINK_PROJECT_ID }} --environment ${{ env.DUPLICATE_FROM_ID }}
      - name: Delete Railway Environment for PR
        run: railway environment delete pr-${{ github.event.pull_request.number }} || true
```

**Note:** If you are using a workspace project, ensure the token is scoped to your account, not a specific workspace.

See the [GitHub Actions PR Environment guide](/guides/github-actions-pr-environment) for the complete setup.

## Redeploying

Redeploy the current deployment without uploading new code:

```bash
railway redeploy
```

This is useful for:
- Applying environment variable changes
- Restarting a crashed service
- Triggering a fresh build with the same code

## Deploying a specific path

You can specify a path to deploy:

```bash
railway up ./backend
```

By default, Railway uses your project root as the archive base. Use `--path-as-root` to use the specified path as the archive root instead:

```bash
railway up ./backend --path-as-root
```

When running `railway up` from a subdirectory without a path argument, Railway still deploys from the project root. To deploy only a specific directory permanently, configure a [root directory](/deployments/monorepo#root-directory) in your service settings.

## Ignoring files

By default, Railway respects your `.gitignore` file. To include ignored files in your deployment:

```bash
railway up --no-gitignore
```

## Verbose output

For debugging deployment issues:

```bash
railway up --verbose
```

## Related

- [CLI Reference](/cli) - Complete CLI command documentation
- [GitHub Autodeploys](/deployments/github-autodeploys) - Automatic deployments from GitHub
- [GitHub Actions Post-Deploy](/guides/github-actions-post-deploy) - Run actions after deployment
- [GitHub Actions PR Environment](/guides/github-actions-pr-environment) - Create environments for PRs
