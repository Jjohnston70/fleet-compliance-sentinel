# Deployments (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/deployments/reference.md
Original Path: docs/deployments/reference.md
Section: docs
Chunk: 2/3

---

#### Restart

Restarts the process within the deployment's container, this is often used to bring a service back online after a crash or if you application has locked up.

#### Redeploy

Redeploys the selected deployment.

This is often used to bring a service back online after -

- A crash.
- A usage limit has been reached and raised.
- Upgrading to Hobby when trial credits were previously depleted.
- Being demoted from Hobby to free and then upgrading again.

**Notes** -

- The redeploy will use the source code from the selected deployment.

- Deployments older than your [plan's retention policy](/pricing/plans#image-retention-policy) cannot be restored via rollback, and thus the rollback option will not be visible.

#### Rollback

Redeploys the selected deployment.

**Notes** -

- The rollback will use the source code from the selected deployment.

- Deployments older than your [plan's retention policy](/pricing/plans#image-retention-policy) cannot be restored via rollback, and thus the rollback option will not be visible.

#### Remove

Stops the currently running deployment, this also marks the deployment as `REMOVED` and moves it into the history section.

#### Abort

Cancels the selected [initializing](#initializing) or [building](#building) deployment, this also marks the deployment as `REMOVED` and moves it into the history section.

## Ephemeral storage

Every service deployment has access to 10GB of ephemeral storage. If a service deployment consumes more than 10GB, it can be forcefully stopped and redeployed.

If your service requires data to persist between deployments, or needs more than 10GB of storage, you should add a [volume](/volumes).

## Singleton deploys

By default, Railway maintains only one deploy per service.

In practice, this means that if you trigger a new deploy either [manually](/deployments/deployment-actions#redeploy) or [automatically](/deployments/github-autodeploys), the old version will be stopped and removed with a slight overlap for zero downtime.

Once the new deployment is online, the old deployment is sent a SIGTERM signal. By default, it is given 0 seconds to gracefully shutdown before being forcefully stopped with a SIGKILL. We do not send any other signals under any circumstances.

The time given to gracefully shutdown can be controlled by setting a [`RAILWAY_DEPLOYMENT_DRAINING_SECONDS`](/variables/reference#user-provided-configuration-variables) [service variable](/overview/the-basics#service-variables).
