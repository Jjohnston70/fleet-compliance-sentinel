# Manage Deployments with the Public API

Learn how to manage deployments via the public GraphQL API.

Here are examples to help you manage your deployments using the Public API.

## List deployments

Get all deployments for a service in an environment:

## Get a single deployment

Fetch a deployment by ID:

## Get latest active deployment

Get the currently running deployment:

## Get build logs

Fetch build logs for a deployment:

## Get runtime logs

Fetch runtime logs for a deployment:

## Get HTTP logs

Fetch HTTP request logs for a deployment:

## Trigger a redeploy

Redeploy an existing deployment:

## Restart a deployment

Restart a running deployment without rebuilding:

## Rollback to a deployment

Rollback to a previous deployment:

You can only rollback to deployments that have `canRollback: true`.

## Stop a deployment

Stop a running deployment:

## Cancel a deployment

Cancel a deployment that is building or queued:

## Remove a deployment

Remove a deployment from the history:

## Deploy a specific service in an environment

Trigger a deployment for a specific service:

## Deployment statuses

| Status | Description |
|--------|-------------|
| `BUILDING` | Deployment is being built |
| `DEPLOYING` | Deployment is being deployed |
| `SUCCESS` | Deployment is running successfully |
| `FAILED` | Deployment failed to build or deploy |
| `CRASHED` | Deployment crashed after starting |
| `REMOVED` | Deployment was removed |
| `SLEEPING` | Deployment is sleeping (inactive) |
| `SKIPPED` | Deployment was skipped |
| `WAITING` | Deployment is waiting for approval |
| `QUEUED` | Deployment is queued |
