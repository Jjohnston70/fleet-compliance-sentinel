# Services (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/services.md
Original Path: docs/services.md
Section: docs
Chunk: 2/3

---

### Updating Docker images

Railway automatically monitors Docker images for new versions. When an update is available, an update button appears in your service settings. If your image tag specifies a version (e.g., `nginx:1.25.3`), updating will stage the new version tag. For tags without versions (e.g., `nginx:latest`), Railway redeploys the existing tag to pull the latest image digest.

To enable automatic updates, configure the update settings in your service. You can specify an update schedule and maintenance window. Note that automatic updates trigger a redeployment, which may cause brief downtime (typically under 2 minutes) for services with attached volumes.

### Deploying a private Docker image

To deploy from a private Docker registry, specify the path of the image when prompted in the creation flow, as well as authentication credentials (username, password) to the registry.

If deploying an image from [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry), provide a [personal access token (classic)](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#authenticating-to-the-container-registry).

### Deploying from a local directory

[Use the CLI](/cli) to deploy a local directory to a service -

1. Create an Empty Service by choosing `Empty Service` during the service creation flow.
2. In a Terminal, navigate to the directory you would like to deploy.
3. Link to your Railway project using the `railway link` CLI command.
4. Deploy the directory using `railway up`. The CLI will prompt you to choose a service target, be sure to choose the empty service you created.

## Deploying a monorepo

For information on how to deploy a Monorepo click [here](/deployments/monorepo).

## Ephemeral storage

Every service deployment has access ephemeral storage, with the limits being 1GB on the Free plan and 100GB on a paid plan. If a service deployment consumes more than its ephemeral storage limit, it can be forcefully stopped and redeployed.

If your service requires data to persist between deployments, or needs more storage, you should add a [volume](/volumes).

## Monitoring

Logs, metrics, and usage information is available for services and projects. Check out the [observability guides](/observability) for information on how to track this data.

## Changing the service icon

Customize your project canvas for easier readability by changing the service icon.

1. Right click on the service
2. Choose `Update Info`
3. Choose `Icon`
4. Begin typing to see a list of available icons, pulled from the [devicons](https://devicons.railway.com/) service.

You can also access this configuration from the command palette.

## Approving a deployment

If a member of a GitHub repo doesn't have a linked Railway account. Railway by default will not deploy any pushes to a connected GitHub branch within Railway.

Railway will then create a Deployment Approval within a Service prompting a user to determine if they want to deploy their commit or not.

Deploy the queued deployment by clicking the "Approve" button. You can dismiss the request by clicking the three dots menu and clicking "Reject".

## Templates

A [template](/templates) is a pre-configured group of services. A template can be used to start a project or to expand an existing project.

## Constraints

- Service names have a max length of 32 characters.
