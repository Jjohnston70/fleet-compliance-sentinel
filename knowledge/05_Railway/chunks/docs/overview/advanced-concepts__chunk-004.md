# Advanced Usage (Chunk 4/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/overview/advanced-concepts.md
Original Path: docs/overview/advanced-concepts.md
Section: docs
Chunk: 4/4

---

## Environments

Railway environments are isolated instances of the services running in your production environment that let you iterate on your workspace without affecting your production workloads. You can:

- Have development environments for each team member that mirror your production environment
- Have separate staging and production environments

Within a service and environment, you can specify which branch of your GitHub repository to deploy to that environment when a commit is pushed.

## Observability

Railway services and deployments will likely output logs to describe how they are being built, what they are doing while running, or errors during either of these.

These logs, when sent to the standard output or standard error (like when using `console.log()`, `print()`, and `console.error()`) will be shown in the [Build and Deploy tabs](/observability/logs#build--deploy-panel) (depending on where they originated) of each service and can be viewed in the [Observability](/observability/logs#log-explorer) page of your project, from which you can view logs from all your services.
