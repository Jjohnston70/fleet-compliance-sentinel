Title: Quick Start Tutorial
Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/quick-start.md
Original Path: docs/quick-start.md
Section: docs

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

## Deploying your project - with the CLI

As with the [Deploy from GitHub guide](/quick-start#deploying-your-project---from-github), if you're deploying code with the CLI for the first time, it's recommended to [fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) the [NextJS app](https://github.com/railwayapp-templates/nextjs-basic)'s repository to follow along. Since you'll be deploying local code, you'll also need to [clone](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) the forked repository.

The CLI can create a new project entirely from the command line, use it to scaffold your project.

- Open up a command prompt inside your local project.

- Run `railway init`

  This will create a new empty project with the name provided, which will be used for any subsequent commands.

Deploying your code is now only a single command away.

- Run `railway up`

  The CLI will now scan your project files, compress them, and upload them to Railway's backend for deployment.

**You can now run `railway open` and you will taken to your [Project Canvas](/quick-start#the-canvas)**.

## Deploying your project - from a Docker image

Railway supports deploying pre-built Docker images from the following registries:

- [Docker Hub](https://hub.docker.com)
- [GitHub Container Registry](https://ghcr.io)
- [RedHat Container Registry](https://quay.io)
- [GitLab Container Registry](https://docs.gitlab.com/ee/user/packages/container_registry)

To get started deploying a Docker image, first make a new [project](/overview/the-basics#project--project-canvas).

- Open up the [dashboard](/overview/the-basics#dashboard--projects) → Click **New Project**.

- Choose the **Empty project** option.

After the project is created, you will land on the [Project Canvas](/quick-start#the-canvas). A panel will appear prompting you to Add a Service.

- Click **Add a Service** and select the **Docker Image** option from the modal that pops up.

- In the **Image name** field, enter the name of the Docker image, e.g, `blueriver/nextjs` and press Enter.

If you're using a registry other than Docker Hub (such as GitHub, GitLab, Quay), you need to provide the full Docker image URL from the respective registry.

- Press Enter and click **Deploy**.

Railway will now provision a new service for your project based on the specified Docker image.

And that's it! 🎉 Your project is now ready for use.

## The canvas

Whether you deploy your project through the dashboard with GitHub or locally using the CLI, you'll ultimately arrive at your project canvas.

This is your _mission control_. Your project's infrastructure, [environments](/guides/environments), and [deployments](/guides/deployments) are all
controlled from here.

Once the initial deployment is complete, your app is ready to go. If applicable, generate a domain by clicking [Generate Domain](/guides/public-networking#railway-provided-domain) within the [service settings](/overview/the-basics#service-settings) panel.

**Additional Information -**

If anything fails during this time, you can explore your [build or deploy logs](/guides/logs#build--deploy-panel) for clues. A helpful tip is to scroll through the entire log; important details are often missed, and the actual error is rarely at the bottom!

If you're stuck don't hesitate to open a [Help Thread](https://station.railway.com/questions).

## Deploying a template

Railway's [template marketplace](https://railway.com/templates) offers over 650+ unique templates that have been created both by the community and Railway!

Deploying a template is not too dissimilar to deploying a GitHub repo -

- Open up the [dashboard](/overview/the-basics#dashboard--projects) → Click **New Project**.

- Choose **Deploy a template**.

- Search for your desired template.

  _Hint: If your desired template isn't found feel free to [reach out to the community](https://station.railway.com/questions)._

- Click on the template you want to deploy.

_Hint: Generally it's best to choose the template with a combined higher deployment and success count._

- Fill out any needed information that the template may require.

  In the case of the Umami template, you don't need to provide any extra information.

- Click **Deploy**.

Railway will now provision a new project with all services and configurations that were defined in the template.

That's it, deploying a template is as easy as a few clicks!

## Closing

Railway aims to be the simplest way to develop, deploy, and diagnose issues with your application.

As your Project scales, Railway scales with you by supporting multiple Teams, vertical scaling, and horizontal scaling; leaving you to focus on what matters: your code.

Happy Building!

### What to explore next

- **[Environments](/environments)** - Railway lets you create parallel, identical environments for PRs/testing.

- **[Observability Dashboard](/observability)** - Railway's built-in observability dashboard offers a customizable view of metrics, logs, and usage in one place.

- **[Project Members](/projects/project-members)** - Adding members to your projects is as easy as sending them an invite link.

- **[Staged Changes](/deployments/staged-changes)** - When you make changes to your Railway project, such as adding or removing components and configurations, these updates will be gathered into a changeset for you to review and apply.

### Join the community

Chat with Railway members, ask questions, and hang out in the [Railway Discord community](https://discord.gg/railway) with fellow builders! We'd love to have you!
