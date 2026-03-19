# Services (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/services.md
Original Path: docs/services.md
Section: docs
Chunk: 1/3

---

# Services

Discover the different types of services available in your Railway projects.

A Railway service is a deployment target. Under the hood, services are containers deployed from an image.

Each service keeps a log of [deployment attempts](/deployments/reference) and [performance metrics](/observability/metrics).

[Variables](/variables), source references (e.g. GitHub repository URI), and relevant [start and build commands](/builds/build-and-start-commands) are also stored in the service, among other configuration.

_As you create and manage your services, your changes will be collected in a set of [staged changes](/deployments/staged-changes) that you must review and deploy, in order to apply them._

## Types of services

#### Persistent services

Services that are always running. Examples include web applications, backend APIs, message queues, database services, etc.

#### Scheduled jobs

Services that are run until completion, on a defined schedule, also called [Cron Jobs](/cron-jobs).

## Creating a service

Create a service by clicking the `New` button in the top right corner of your project canvas, or by typing new service from the **command palette**, accessible via `CMD + K` (Mac) or `Ctrl + K`(Windows).

Services on Railway can be deployed from a GitHub repository, a local directory, or a Docker image.

## Accessing service settings

To access a service's settings, simply click on the service tile from your project canvas and go to the Settings tab.

## Service source

A service source can be any of the following - Docker Image, GitHub or Local repository.

If a [Dockerfile](/builds/dockerfiles) is found within the source repository, Railway will automatically use it to build an image for the service.

If you've created an empty service, or would like to update the source for a deployed service, you can do so in the Service settings.

Click on the service, go to the Settings tab, and find the **Service Source** setting.

### Deploying from a GitHub repo

Define a GitHub repository as your service source by selecting `Connect Repo` and choosing the repository you'd like to deploy.

When a new commit is pushed to the linked branch, Railway will automatically build and deploy the new code.

You must link your Railway account to GitHub, to enable Railway to connect to your GitHub repositories. [You can configure the Railway App in GitHub by clicking this link.](https://github.com/apps/railway-app/installations/new)

### Deploying a public Docker image

To deploy a public Docker image, specify the path of the image when prompted in the creation flow.

Railway can deploy images from [Docker Hub](https://hub.docker.com/), [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry), [Quay.io](https://quay.io/), or [GitLab Container Registry](https://docs.gitlab.com/ee/user/packages/container_registry/). Example paths -

Docker Hub:

- `bitnami/redis`

GitHub Container Registry:

- `ghcr.io/railwayapp-templates/postgres-ssl:latest`

GitLab Container Registry:

- `registry.gitlab.com/gitlab-cicd15/django-project`

Microsoft Container Registry:

- `mcr.microsoft.com/dotnet/aspire-dashboard`

Quay.io:

- `quay.io/username/repo:tag`
