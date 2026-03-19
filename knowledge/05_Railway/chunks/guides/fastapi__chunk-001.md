# Deploy a FastAPI App (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/fastapi.md
Original Path: guides/fastapi.md
Section: guides
Chunk: 1/2

---

# Deploy a FastAPI App

Learn how to deploy a FastAPI app to Railway with this step-by-step guide. It covers quick setup, one-click deploys, Dockerfile and other deployment strategies.

FastAPI is a modern, fast (high-performance), web framework for building APIs with Python based on standard Python type hints.

This guide covers how to deploy a FastAPI app on Railway in four ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [From a GitHub repository](#deploy-from-a-github-repo).
3. [Using the CLI](#deploy-from-the-cli).
4. [Using a Dockerfile](#use-a-dockerfile).

## One-click deploy from a template

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/-NvLj4)

It is highly recommended that [you eject from the template after deployment](/templates/deploy#eject-from-template-repository) to create a copy of the repo on your GitHub account.

**Note:** You can also choose from a [variety of FastAPI app templates](https://railway.com/templates?q=fastapi) created by the community.

## Deploy from a GitHub repo

To deploy a FastAPI app on Railway directly from GitHub, follow the steps below:

1. Fork the basic [FastAPI GitHub repo](https://github.com/railwayapp-templates/fastapi).
   - If you already have a GitHub repo you want to deploy, you can skip this step.
2. Create a [New Project.](https://railway.com/new)
3. Click **Deploy from GitHub repo**.
4. Select the `fastapi` or your own GitHub repo.
   - Railway requires a valid GitHub account to be linked. If your Railway account isn't associated with one, you will be prompted to link it.
5. Click **Deploy Now**.

Once the deployment is successful, a Railway [service](/services) will be created for you. By default, this service will not be publicly accessible.

To set up a publicly accessible URL for the service, navigate to the **Networking** section in the [Settings](/overview/the-basics#service-settings) tab of your new service and click on [Generate Domain](/networking/public-networking#railway-provided-domain).

The FastAPI app is run via a [Hypercorn server](https://hypercorn.readthedocs.io/en/latest/) as defined by the `startCommand` in the [railway.json](https://github.com/railwayapp-templates/fastapi/blob/main/railway.json) file in the GitHub repository.

Railway makes it easy to define deployment configurations for your services directly in your project using a [railway.toml or railway.json file](/guides/config-as-code), alongside your code.

## Deploy from the CLI

1. [Install](/guides/cli#installing-the-cli) and [authenticate with the CLI.](/guides/cli#authenticating-with-the-cli)
2. Clone the forked [fastapi GitHub repo](https://github.com/railwayapp-templates/fastapi) and `cd` into the directory.
   - You can skip this step if you already have an app directory or repo on your machine that you want to deploy.
3. Run `railway init` within the app directory to create a new project.
4. Run `railway up` to deploy.
   - The CLI will now scan, compress and upload your fastapi app files to Railway's backend for deployment.
