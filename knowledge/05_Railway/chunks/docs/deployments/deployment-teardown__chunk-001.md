# Deployment Teardown (Chunk 1/1)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/deployments/deployment-teardown.md
Original Path: docs/deployments/deployment-teardown.md
Section: docs
Chunk: 1/1

---

# Deployment Teardown

Learn how to configure the deployment lifecycle to create graceful deploys with zero downtime.

By default, Railway maintains only one deploy per service. This means that if you trigger a new deploy, the previous version will be stopped and removed after the new version deploys. There are two configuration options in the "Settings" pane for a service that allow you to slightly overlap the new and preview versions for zero downtime:

To learn more about the full deployment lifecycle, see the [deploy reference](/deployments).

#### Overlap time

Once the new deployment is active, the previous deployment remains active for a configurable amount of time. You can control this via the "Settings" pane for the service. It can also be configured via [code](/config-as-code/reference#overlap-seconds) or the [`RAILWAY_DEPLOYMENT_OVERLAP_SECONDS` service variable](/variables/reference#user-provided-configuration-variables).

#### Draining time

Once the new deployment is active, the previous deployment is sent a SIGTERM signal and given time to gracefully shutdown before being forcefully stopped with a SIGKILL. The time to gracefully shutdown can be controlled via the "Settings" pane. It can also be configured via [code](/config-as-code/reference#draining-seconds) or the [`RAILWAY_DEPLOYMENT_DRAINING_SECONDS` service variable](/variables/reference#user-provided-configuration-variables).
