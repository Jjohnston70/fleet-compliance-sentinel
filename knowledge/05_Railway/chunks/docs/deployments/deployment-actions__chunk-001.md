# Deployment Actions (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/deployments/deployment-actions.md
Original Path: docs/deployments/deployment-actions.md
Section: docs
Chunk: 1/2

---

# Deployment Actions

Explore the full range of actions available on the Service Deployments tab to manage your deployments.

Various actions can be taken on Deployments from within the Service -> Deployments tab and clicking on the three dots at the end of a previous deployment.

## Rollback

Rollback to previous deployments if mistakes were made. To perform a rollback, click the three dots at the end of a previous deployment, you will then be asked to confirm your rollback.

A deployment rollback will revert to the previously successful deployment. Both the Docker
image and custom variables are restored during the rollback process.

_Note: Deployments older than your [plan's retention policy](/pricing/plans#image-retention-policy) cannot be restored via rollback, and thus the rollback option will not be visible._

## Redeploy

A successful, failed, or crashed deployment can be re-deployed by clicking the three dots at the end of a previous deployment.

This will create an new deployment with the exact same code and build/deploy configuration.

_Note: To trigger a deployment from the latest commit, use the Command Palette: `CMD + K` -> "Deploy Latest Commit". This will deploy the latest commit from the **Default** branch in GitHub._

_Currently, there is no way to force a deploy from a branch other than the Default without [connecting it in your service settings](/deployments/github-autodeploys#configure-the-github-branch-for-deployment-triggers)._

## Cancel

Users can cancel deployments in progress by clicking the three dots at the end
of the deployment tab and select Abort deployment. This will cancel the
deployment in progress.

## Remove

If a deployment is completed, you can remove it by clicking the three dots
at the end of the deployment tab and select Remove. This will remove the
deployment and stop any further project usage.

## Restart a crashed deployment

When a Deployment is `Crashed`, it is no longer running because the underlying process exited with a non-zero exit code - if your deployment exits successfully (exit code 0), the status will remain `Success`.

Railway automatically restarts crashed Deployments up to 10 times (depending on your [Restart Policy](/deployments/restart-policy#plan-limitations)). After this limit is reached, your deployment status is changed to `Crashed` and notifying webhooks & emails are sent to the project's members.

Restart a `Crashed` Deployment by visiting your project and clicking on the "Restart" button that appears in-line on the Deployment:

Restarting a crashed Deployment restores the exact image containing the code & configuration of the original build. Once the Deployment is back online, its status will change back to `Success`.

You can also click within a deployment and using the Command Palette restart a deployment at any state.
