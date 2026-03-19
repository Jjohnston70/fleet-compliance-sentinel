# Controlling GitHub Autodeploys (Chunk 1/1)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/deployments/github-autodeploys.md
Original Path: docs/deployments/github-autodeploys.md
Section: docs
Chunk: 1/1

---

# Controlling GitHub Autodeploys

Learn how to configure GitHub autodeployments.

[Services that are linked to a GitHub repo](/services#deploying-from-a-github-repo) automatically deploy when new commits are detected in the connected branch.

## Configure the GitHub branch for deployment triggers

To update the branch that triggers automatic deployments, go to your Service Settings and choose the appropriate trigger branch.

### Disable automatic deployments

To disable automatic deployment, simply hit `Disconnect` in the Service Settings menu.

_Note: To manually trigger a deployment from the latest commit, use the Command Palette: `CMD + K` -> "Deploy Latest Commit". This will deploy the latest commit from the **Default** branch in GitHub._

_Currently, there is no way to force a deploy from a branch other than the Default without connecting it in your service settings._

## Wait for CI

To ensure Railway waits for your GitHub Actions to run successfully before triggering a new deployment, you should enable **Wait for CI**.

#### Requirements

- You must have a GitHub workflow defined in your repository.
- The GitHub workflow must contain a directive to run on push:

  ```plaintext
  on:
    push:
      branches:
        - main
  ```

### Enabling wait for CI

If your workflow satisfies the requirements above, you will see the `Wait for CI` flag in service settings.

Toggle this on to ensure Railway waits for your GitHub Actions to run successfully before triggering a new deployment.

When enabled, deployments will be moved to a `WAITING` state while your workflows are running.

If any workflow fails, the deployments will be `SKIPPED`.

When all workflows are successful, deployments will proceed as usual.
