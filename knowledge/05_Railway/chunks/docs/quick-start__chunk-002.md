# Quick Start Tutorial (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/quick-start.md
Original Path: docs/quick-start.md
Section: docs
Chunk: 2/3

---

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
