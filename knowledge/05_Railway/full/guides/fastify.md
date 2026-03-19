Title: Deploy a Fastify App
Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/fastify.md
Original Path: guides/fastify.md
Section: guides

---

# Deploy a Fastify App

Learn how to deploy a Fastify app to Railway with this step-by-step guide. It covers quick setup, one-click deploys, Dockerfile and other deployment strategies.

Fastify is a high-performance, low-overhead web framework for Node.js, designed to deliver an exceptional developer experience.

This guide covers how to deploy a Fastify app on Railway in four ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [From a GitHub repository](#deploy-from-a-github-repo).
3. [Using the CLI](#deploy-from-the-cli).
4. [Using a Dockerfile](#use-a-dockerfile).

## One-click deploy from a template

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/ZZ50Bj)

It is highly recommended that [you eject from the template after deployment](/templates/deploy#eject-from-template-repository) to create a copy of the repo on your GitHub account.

**Note:** You can also choose from a [variety of Fastify app templates](https://railway.com/templates?q=fastify) created by the community.

## Deploy from a GitHub repo

To deploy a Fastify app on Railway directly from GitHub, follow the steps below:

1. Fork the basic [fastify GitHub repo](https://github.com/railwayapp-templates/fastify).
   - If you already have a GitHub repo you want to deploy, you can skip this step.
2. Create a [New Project.](https://railway.com/new)
3. Click **Deploy from GitHub repo**.
4. Select the `fastify` repo or your own GitHub repo.
   - Railway requires a valid GitHub account to be linked. If your Railway account isn't associated with one, you will be prompted to link it.
5. Click **Deploy Now**.

Once the deployment is successful, a Railway [service](/services) will be created for you. By default, this service will not be publicly accessible.

To set up a publicly accessible URL for the service, navigate to the **Networking** section in the [Settings](/overview/the-basics#service-settings) tab of your new service and click on [Generate Domain](/networking/public-networking#railway-provided-domain).

**Note:** Railway requires that Fastify's `.listen` method for the `host` be set to `::`. This allows the app to be available over the [public](/guides/public-networking) and [private network](/guides/private-networking).
You can find this in the [sample Fastify GitHub repo](https://github.com/railwayapp-templates/fastify/blob/main/src/app.ts).

If you don’t set it correctly, you may encounter a 502 error page.

## Deploy from the CLI

1. [Install](/guides/cli#installing-the-cli) and [authenticate with the CLI.](/guides/cli#authenticating-with-the-cli)
2. Clone the forked [fastify GitHub repo](https://github.com/railwayapp-templates/fastify) and `cd` into the directory.
   - You can skip this step if you already have an app directory or repo on your machine that you want to deploy.
3. Run `railway init` within the app directory to create a new project.
4. Run `railway up` to deploy.
   - The CLI will now scan, compress and upload your fastify app files to Railway's backend for deployment.

## Use a Dockerfile

1. Clone the forked `fastify` repo and `cd` into the directory.
   - You can skip this step if you already have an app directory or repo on your machine that you want to deploy.
2. Create a `Dockerfile` in the `fastify` or app's root directory.
3. Add the content below to the `Dockerfile`:

   ```bash
   # Use the Node.js 18 alpine official image
   # https://hub.docker.com/_/node
   FROM node:18-alpine

   # Create and change to the app directory.
   WORKDIR /app

   # Copy local code to the container image.
   COPY . .

   # Install project dependencies
   RUN npm ci

   # Run the web service on container startup.
   CMD ["npm", "start"]
   ```

4. Either deploy via the CLI or from GitHub.

Railway automatically detects the `Dockerfile`, [and uses it to build and deploy the app.](/builds/dockerfiles)

**Note:** Railway supports also [deployment from public and private Docker images](/guides/services#deploying-a-public-docker-image).

## Next steps

Explore these resources to learn how you can maximize your experience with Railway:

- [Add a CDN using Amazon CloudFront to your Fastify app](/guides/add-a-cdn-using-cloudfront)
- [Add a Database Service](/databases/build-a-database-service)
- [Monitor your app](/observability)
