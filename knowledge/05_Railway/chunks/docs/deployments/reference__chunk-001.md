# Deployments (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/deployments/reference.md
Original Path: docs/deployments/reference.md
Section: docs
Chunk: 1/3

---

# Deployments

Deployments are attempts to build and deliver your service. Learn how they work on Railway.

Deployments are attempts to build and deliver your [service](/services).

All deployments will appear in the deployments view on your selected service.

## How it works

Upon service creation, or when changes are detected in the service source, Railway will build the service and package it into a container with [Railpack](/builds/railpack) or a [Dockerfile](/builds/dockerfiles) if present. If the source is a Docker Image, the build step is skipped.

Railway then starts the service using either the detected or configured [Start Command](/builds/build-and-start-commands).

This cycle represents a deployment in Railway.

## Deployment states

A comprehensive up to date list of statues can be found in [Railway's GraphQL playground](https://railway.com/graphiql) under DeploymentStatus ([screenshot](https://res.cloudinary.com/railway/image/upload/v1737950391/docs/deploy-statuses.png)).

Deployments can be in any of the following states:

#### Initializing

Every Deployment in Railway begins as `Initializing` - once it has been accepted into Railway's build queue, the status will change to `Building`.

#### Building

While a Deployment is `Building`, Railway will attempt to create a deployable Docker image containing your code and configuration (see [Builds](/builds)).

#### Deploying

Once the build succeeds, Railway will attempt to deploy your image and the Deployment's status becomes `Deploying`. If a [healthcheck](/deployments/healthchecks) is configured, Railway will wait for it to succeed before proceeding to the next step.

#### Failed

If an error occurs during the build or deploy process, the Deployment will stop and the status will become `Failed`.

#### Active

Railway will determine the deployment's active state with the following logic -

- If the deployment **has** a [healthcheck](/deployments/healthchecks) configured, Railway will mark the deployment as `Active` when the healthcheck succeeds.

- If the deployment **does not** have a healthcheck configured, Railway will mark the deployment as `Active` after starting the container.

#### Completed

This is the status of the Deployment when the running app exits with a zero exit code.

#### Crashed

A Deployment will remain in the `Active` state unless it [crashes](/deployments/deployment-actions#restart-a-crashed-deployment), at which point it will become `Crashed`.

#### Removed

When a new [Deployment](/overview/the-basics#deployments) is triggered, older deploys in a `Active`, `Completed`, or a `Crashed` state are eventually removed - first having their status updated to `Removing` before they are finally `Removed`. Deployments may also be [removed manually](/deployments/reference#remove).

The time from when a new deployment becomes `Active` until the previous deployment is removed can be controlled by setting a [`RAILWAY_DEPLOYMENT_OVERLAP_SECONDS`](/variables/reference#user-provided-configuration-variables) [service variable](/overview/the-basics#service-variables).

## Deployment menu

The deployment menu contains actions you can take on a deployment.

**Note:** Some actions are only available on certain deployment states.

#### View logs

Opens the deployment up to the corresponding logs, during build the build logs will be shown, during deploy the deploy logs will be shown.
