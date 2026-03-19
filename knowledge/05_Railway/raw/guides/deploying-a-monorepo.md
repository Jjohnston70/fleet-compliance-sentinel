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

## 4. Directory setup

Both apps deploy from subdirectories of the monorepo, so you need to tell Railway where they are located.

- Open the Frontend service to its service settings and you will see a **Root Directory** option, in this case, set it to `/frontend`

- Open the Backend service settings and set its root directory to `/backend`

- Click the `Deploy` button or `⇧ Enter` to save these changes.

## 5. Connecting the repo

Now configure the source of the service where the code is deployed.

- Open the service settings for each service and connect your monorepo.

Frontend

Backend

- Click the `Deploy` button or `⇧ Enter` to deploy your applications

**Your services will now build and deploy.**

## 6. Domain setup

Even though the services are now running, the frontend and backend aren't networked together yet. So let's setup domains for each service.

Both the Vite Frontend and the Go Backend are already configured so that Railway will ✨automagically detect the port they're running on. Railway does this by detecting the `env.$PORT` variable that the service is binding. For simplicity's sake, these two services will be connected over their public domain so you can get a handle on the basics. In practice, you may need to configure your networking a bit differently. You can [read more about networking in the docs](/networking/public-networking).

Let's add public domains to both services.

- Click on the service and then open the Settings tab.

- Click on `Generate Domain`. Railway will ✨automagically assign the port based on the deployed service.

- Do these steps for both services, so that they both have public domains.

**Notes:**

- **Setting a Custom `$PORT`:** Adding the domain after the service is deployed allows Railway to detect the bound `env.$PORT`. You could instead decide to manually set the `$PORT` variable on the Variables tab, and set the Domain to use that custom port instead.

## 7. Variable setup

For the example monorepo the Frontend service needs a `VITE_BACKEND_HOST` variable, and the backend needs an `ALLOWED_ORIGINS` variable.

Let's add the Frontend variable first.

- Click on Frontend service, then the `Variables` tab

- Add the required variable -

      ```plaintext
      VITE_BACKEND_HOST=${{Backend.RAILWAY_PUBLIC_DOMAIN}}
      ```

  It should look like this once added:

Now let's add the Backend variable.

- Click on the Backend service, then the `Variables` tab

- Add the required variable -

  ```plaintext
  ALLOWED_ORIGINS=${{Frontend.RAILWAY_PUBLIC_DOMAIN}}
  ```

It should look like this once added:

- Click the `Deploy` button or `⇧ Enter` to save these changes.

- Your services should be deployed and available now! Click on your frontend service on the Deployment tab and you can click your domain to see the webapp.

**Notes:**

- The variables used here are reference variables, learn more about them [here](/variables#referencing-another-services-variable).

- Both the Frontend and Backend variables reference each other's public domains. The `RAILWAY_PUBLIC_DOMAIN` variable will be automatically updated whenever you deploy or re-deploy a service.

- See a list of additional variables [here](/variables/reference#railway-provided-variables).

## Conclusion

Congratulations! You have setup a project, setup services, added variables and deployed your monorepo project to Railway. The Frontend service should be accessible on its public domain to access the deployed website.
