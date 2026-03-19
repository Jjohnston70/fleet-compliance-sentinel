# Environments (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/environments.md
Original Path: docs/environments.md
Section: docs
Chunk: 2/2

---

### Domains in PR environments

To enable automatic domain provisioning in PR environments, ensure that services in your base environment use Railway-provided domains. Services in PR environments will only receive domains automatically when their corresponding base environment services have Railway-provided domains.

### Focused PR environments

For monorepos and multi-service projects, Focused PR Environments only deploy services affected by files changed in the pull request. This speeds up PR environments and reduces resource usage.

#### How it works

When a PR is opened, Railway determines which services to deploy:

1. Services connected to the PR repo that are affected by changed files (based on [watch paths](/deployments/monorepo#watch-paths) or [root directory](/deployments/monorepo#deploying-an-isolated-monorepo))
2. Dependencies of affected services (via variable references like `${{service.URL}}`)

All other services are skipped and indicated on the canvas. The GitHub PR comment shows which services were skipped.

#### Deploying skipped services

Skipped services can be deployed manually from the canvas. Click on the skipped service and select "Deploy" to add it to the PR environment.

#### Enabling focused PR environments

1. Go to **Project Settings → Environments**
2. Ensure PR Environments are enabled
3. Toggle **Enable Focused PR Environments**

### Bot PR environments

You can enable automatic PR environment creation for PRs opened by GitHub bots using the `Enable Bot PR Environments` toggle on the Environments tab in the Project Settings page.

This works with any GitHub bot, including Dependabot, Renovate, GitHub Copilot, Claude Code, Devin, Jules, and more.

## Environment RBAC

Restrict access to sensitive environments like production. Non-admin members can see these environments exist but cannot access their resources (variables, logs, metrics, services, and configurations). They can still trigger deployments via git push.

| Role | Can access | Can toggle |
| :--- | :---: | :---: |
| Admin | ✔️ | ✔️ |
| Member | ❌ | ❌ |
| Deployer | ❌ | ❌ |

For detailed setup instructions and best practices, see the [Environment RBAC guide](/enterprise/environment-rbac).

## Forked environments (deprecated)

As of January 2024, forked environments have been deprecated in favor of Isolated Environments with the ability to Sync.

Any environments forked prior to this change will remain, however, you must adopt the [Sync Environments](#sync-environments) flow, in order to merge changes into your base environment.

## Troubleshooting

Having issues with environments? Check out the [Troubleshooting guide](/troubleshooting) or reach out on [Central Station](https://station.railway.com).
