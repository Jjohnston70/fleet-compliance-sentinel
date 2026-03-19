# Deploy a Gin App (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/gin.md
Original Path: guides/gin.md
Section: guides
Chunk: 1/2

---

# Deploy a Gin App

Learn how to deploy a Gin app to Railway with this step-by-step guide. It covers quick setup, one-click deploys, Dockerfile and other deployment strategies.

[Gin](https://gin-gonic.com) is a high-performance web framework for Go (Golang) that provides a martini-like API while being significantly faster (up to 40 times) due to its use of `httprouter`. It's designed for developers seeking both speed and productivity.

This guide covers how to deploy a Gin app on Railway in four ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [From a GitHub repository](#deploy-from-a-github-repo).
3. [Using the CLI](#deploy-from-the-cli).
4. [Using a Dockerfile](#use-a-dockerfile).

## One-click deploy from a template

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/dTvvSf)

It is highly recommended that [you eject from the template after deployment](/templates/deploy#eject-from-template-repository) to create a copy of the repo on your GitHub account.

**Note:** You can also choose from a [variety of Gin app templates](https://railway.com/templates?q=gin) created by the community.

## Deploy from a GitHub repo

To deploy a Gin app on Railway directly from GitHub, follow the steps below:

1. Fork the basic [Gin GitHub repo](https://github.com/railwayapp-templates/gin).
   - If you already have a GitHub repo you want to deploy, you can skip this step.
2. Create a [New Project.](https://railway.com/new)
3. Click **Deploy from GitHub repo**.
4. Select the `gin` or your own GitHub repo.
   - Railway requires a valid GitHub account to be linked. If your Railway account isn't associated with one, you will be prompted to link it.
5. Click **Deploy Now**.

Once the deployment is successful, a Railway [service](/services) will be created for you. By default, this service will not be publicly accessible.

To set up a publicly accessible URL for the service, navigate to the **Networking** section in the [Settings](/overview/the-basics#service-settings) tab of your new service and click on [Generate Domain](/networking/public-networking#railway-provided-domain).

## Deploy from the CLI

1. [Install](/guides/cli#installing-the-cli) and [authenticate with the CLI.](/guides/cli#authenticating-with-the-cli)
2. Clone the forked [gin GitHub repo](https://github.com/railwayapp-templates/gin) and `cd` into the directory.
   - You can skip this step if you already have an app directory or repo on your machine that you want to deploy.
3. Run `railway init` within the app directory to create a new project.
4. Run `railway up` to deploy.
   - The CLI will now scan, compress and upload your gin app files to Railway's backend for deployment.
