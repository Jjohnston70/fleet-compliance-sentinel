# Migrate from Render to Railway (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/migrate-from-render.md
Original Path: docs/platform/migrate-from-render.md
Section: docs
Chunk: 1/2

---

# Migrate from Render to Railway

Learn how to migrate your apps from Render to Railway with this step-by-step guide. Fast, seamless, and hassle-free.

This guide walks you through the steps needed to seamlessly migrate your app and data from Render to Railway.

With features like instant deployments, CI/CD integrations, private networking, observability, and effortless scaling, Railway helps developers focus on building rather than managing infrastructure.

Railway boasts of a superior and intuitive user experience that makes deploying complex workloads easy to configure and manage.

Railway offers:

- **Broad Language and Framework Support**: Deploy apps in [any language or framework](/languages-frameworks).
- **Flexible Deployment Options**: Use GitHub, Dockerfiles, Docker images from supported registries (Docker Hub, GitHub, RedHat, GitLab, Microsoft), or local deployments via the Railway CLI.
- **Integrated Tools**: Simplify environment variable management, CI/CD, observability, and service scaling.
- **Networking Features:** Public and private networking.
- **Best in Class Support:** Very active community on [Discord](https://discord.gg/railway) and the [Railway Help Station](https://station.railway.com/).

..and so much more. Want to see for yourself? [Try Railway for a spin today!](https://railway.com/new)

## Migration steps

In this guide, we will migrate a Go (Beego) app with a Postgres database from Render to Railway.

Here’s the link to the app. A simple chat app that have the options of Long polling and Web socket: https://github.com/unicodeveloper/beego-WebIM

### 1. Set up a Railway project

Navigate to [Railway's Project Creation Page](https://railway.com/new).

Select the **Deploy from GitHub Repo** option and connect your repository. If your Railway account isn’t linked to GitHub yet, you’ll be prompted to do so.

![Set up a Railway Project](https://res.cloudinary.com/railway/image/upload/v1736366540/newproject_ljvsqp.png)

### 2. Deploy the app

Railway automatically detects a `render.yaml` file in your repository and provisions the corresponding services, including databases, web (both public and private), crons, and workers.

If environment variables are defined in your `render.yaml`, Railway will import them automatically to the appropriate services. If they are not defined, you can manually migrate them by following these steps:

**On Render**:

1. Go to the **Environment Variables** page of your service.
2. Copy all the variables and their values.

**On Railway**:

1. Open the **Variables** section for the relevant service.
2. Switch to the **Raw Editor** and paste the copied environment variables.
3. Deploy the changes to apply the configuration.

![Deploy on Railway](https://res.cloudinary.com/railway/image/upload/v1736366539/deployapp_rlhvzx.png)

Railway will deploy both the Go app as a service and the database, as shown in the image above. You can monitor the service building and deploying in the [Project Canvas](/projects#project-canvas).
