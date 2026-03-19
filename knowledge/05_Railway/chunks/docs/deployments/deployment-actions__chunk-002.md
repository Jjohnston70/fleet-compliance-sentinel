# Deployment Actions (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/deployments/deployment-actions.md
Original Path: docs/deployments/deployment-actions.md
Section: docs
Chunk: 2/2

---

## Deployment dependencies - startup ordering

You can control the order your services start up with [Reference Variables](/variables#reference-variables).
When one service references another, it will be deployed after the service it is referencing when applying a [staged change](/deployments/staged-changes) or [duplicating an environment](/environments#create-an-environment).

Services that have circular dependencies will simply ignore them and deploy as normal.

For example, let's say you're deploying an API service that depends on a [PostgreSQL database](/databases/postgresql).

When you have services with reference variables like:

- API Service has `DATABASE_URL=${{Postgres.DATABASE_URL}}` which is defined on your Postgres Service in the same project.

Railway will:

1. Deploy the Postgres Service first
2. Then deploy the API Service (since it has a reference variable to Postgres)
