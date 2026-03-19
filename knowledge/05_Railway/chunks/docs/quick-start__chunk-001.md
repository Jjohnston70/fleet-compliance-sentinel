# Quick Start Tutorial (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/quick-start.md
Original Path: docs/quick-start.md
Section: docs
Chunk: 1/3

---

# Quick Start Tutorial

Get started with Railway in minutes! This Quick Start tutorial walks you through deploying your first app via GitHub, the CLI, a Docker image, or a template.

Railway is a deployment platform that lets you provision infrastructure, develop locally with that infrastructure, and deploy to the cloud or simply run ready-made software from the template marketplace.

**This guide covers two different topics to get you quickly started with the platform -**

1. **Deploying your project** - Bring your code and let Railway handle the rest.

   **[Option 1](/quick-start#deploying-your-project---from-github)** - Deploying from **GitHub**.

   **[Option 2](/quick-start#deploying-your-project---with-the-cli)** - Deploying with the **[CLI](/cli)**.

   **[Option 3](/quick-start#deploying-your-project---from-a-docker-image)** - Deploying from a **Docker Image**.

2. **Deploying a [template](reference/templates)** - Ideal for deploying pre-configured software with minimal effort.

To demonstrate deploying directly from a GitHub repository through Railway's dashboard, this guide uses a basic [NextJS app](https://github.com/railwayapp-templates/nextjs-basic) that was prepared for this guide.

For the template deployment, this guide uses the [Umami template](https://railway.com/template/umami-analytics) from the [template marketplace](https://railway.com/templates).

## Deploying your project - from GitHub

If this is your first time deploying code on Railway, it is recommended to [forking](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) the previously mentioned [NextJS app](https://github.com/railwayapp-templates/nextjs-basic)'s repository so that you can follow along.

To get started deploying your NextJS app, first make a new [project](/overview/the-basics#project--project-canvas).

- Open up the [dashboard](/overview/the-basics#dashboard--projects) → Click **New Project**.

- Choose the **GitHub repo** option.

_Railway requires a valid GitHub account to be linked. If your Railway account isn't associated with one, you will be prompted to link it._

- Search for your GitHub project and click on it.

- Choose either **Deploy Now** or **Add variables**.

  **Deploy Now** will immediately start to build and deploy your selected repo.

  **Add Variables** will bring you to your service and ask you to add variables, when done you will need to click the **Deploy** button at the top of your canvas to initiate the first deployment.

  _For brevity, choose **Deploy Now**._

When you click **Deploy Now**, Railway will create a new project for you and kick off an initial deploy after the project is created.

**Once the project is created you will land on your [Project Canvas](/quick-start#the-canvas)**.
