# Deploying a Monorepo to Railway (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/deploying-a-monorepo.md
Original Path: guides/deploying-a-monorepo.md
Section: guides
Chunk: 1/2

---

# Deploying a Monorepo to Railway

Learn how to deploy a monorepo to Railway.

## What is a monorepo?

A monorepo is a project directory structure in which multiple, co-dependent codebases (such as a frontend and a backend) are maintained within the same repository, and in some cases, share common packages.

## About this tutorial

Deploying a monorepo in Railway requires some extra configuration to get the applications up and running.

This tutorial aims to provide a simple step-by-step on how to deploy a frontend and backend from an isolated monorepo, one of the most commonly deployed types of monorepo.

The procedure outlined in this tutorial can easily be adapted to deploy different apps that are contained within a isolated monorepo as well.

For more information on deploying a shared monorepo check out the [guide](/deployments/monorepo#deploying-a-shared-monorepo) that explains some of the specific configurations you would need. If you are importing a JS monorepo, check out the [guide](/deployments/monorepo#automatic-import-for-javascript-monorepos) for automatic import.

**Objectives**

In this tutorial, you will learn how to -

- Create an empty project.
- Rename a project.
- Create empty services.
- Rename services.
- Generate domains for services.
- Set variables on a service.
- Connect a GitHub repo to a service.

**Prerequisites**

For the sake of this tutorial, there is a simple [example monorepo](https://github.com/railwayapp-templates/monorepo-example) with a frontend and a backend service. In practice, your monorepo is probably a lot more complicated, but the principles here will enable you to wire up each of your applications in your monorepo to a service and network those services together.

The frontend is built with [React](https://react.dev/) and [Vite](https://vitejs.dev/), and the static files are served with [Caddy](https://caddyserver.com/).

The backend, built with [Go](https://go.dev/), will stream quotes that will be displayed on the frontend.

Before you start:

1. Fork the repo: https://github.com/railwayapp-templates/monorepo-example
2. [Connect your GitHub to Railway.](/quick-start#deploying-your-project---from-github) This will enable you to deploy any of your repositories to Railway in the future as well!

**Let's get started!**

## 1. Create a new empty project

- From [your dashboard](https://railway.com/dashboard) click `+ New Project` or `⌘ k`

- Choose `Empty project`

**Note:** An empty project is chosen instead of deploying from a GitHub repo since you want to set up the project before deploying.

## 2. Project setup

- You'll notice Railway automatically named the project, but you want something more recognizable. Open the Settings tab to `Update` the name of your project. You'll also notice the Danger tab here, when you want to delete your project after you're done with the tutorial.

- Click `Update`

## 3. Service creation

- Add **two** new **empty** services from the `+ Create` button in the top right of the project canvas.

**Note:** An empty service is chosen instead of deploying from a GitHub repo since you want to configure the service before deploying.

The result will look like this -

- Give them both applicable names.

  **Note:** This can be done easiest via the right-click context menu.

In the case of this tutorial, they will be named `Frontend` and `Backend`

- Click the `Deploy` button or `⇧ Enter` to create these two services.
