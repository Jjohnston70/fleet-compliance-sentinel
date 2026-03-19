# Migrate from Fly to Railway (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/migrate-from-fly.md
Original Path: docs/platform/migrate-from-fly.md
Section: docs
Chunk: 1/2

---

# Migrate from Fly to Railway

Learn how to migrate your apps from Fly.io to Railway with this step-by-step guide. Fast, seamless, and hassle-free.

This guide walks you through the steps needed to seamlessly migrate your app and data from Fly.io to Railway. This process is straightforward and typically takes an average of **5 - 20 minutes**, depending on the size of your database and app complexity.

**TL;DR: Quick Migration Steps**

- Set up new app on Railway
- Export data from Fly.io and Import into Railway DB
- Deploy app (including auto-migration of app config & variables)

We provide everything Fly.io offers and more! Check out the [comparison guide](/platform/compare-to-fly) to see the differences and make an informed choice.

Why take Railway's word for it? Experience the [Railway advantage yourself, give it a spin today!](https://railway.com/new)

## Migration steps

In this guide, we will migrate a Go (Gin) app with a Postgres database from Fly.io to Railway. While we are using this app as an example, the process applies to any app, making it easy to transition your projects smoothly.

Here’s the link to the [app](https://github.com/unicodeveloper/gin).

### 1. Set up a Railway project

Navigate to [Railway's Project Creation Page](https://railway.com/new).

Select the **Deploy from GitHub Repo** option and connect your repository. If your Railway account isn’t linked to GitHub yet, you’ll be prompted to do so.

![Railway new project](https://res.cloudinary.com/railway/image/upload/v1737143344/railwaynewproject_d4jv8c.png)

### 2. Deploy the app

Railway auto-imports all the build configurations, deploy commands, environment variables from your Fly.io app repo. No manual setup needed.

If the environment variables are missing, you can easily add them manually by following these steps:

### Adding environment variables on Railway:

1. Navigate to the **Variables** section of your service.
2. Switch to the **Raw Editor** and paste the copied environment variables.
3. Deploy the changes to apply the configuration.

![Variables imported automatically from fly.toml into Railway service](https://res.cloudinary.com/railway/image/upload/v1737143351/environmentvariables_q0xmyh.png)

Railway will deploy the Gin app as a service, as shown in the image above. You can monitor the service building and deploying in the [Project Canvas](/projects#project-canvas).

[**Serverless (App Sleep) activated**](/deployments/serverless): In this [**Fly.io** app](https://github.com/unicodeveloper/gin/blob/main/fly.toml), the HTTP service is configured with **`auto_stop_machines='stop'`** and **`auto_start_machines=true`**, enabling automatic stopping and restarting of machines. On Railway import, we automatically enable this setting to effortlessly optimize resource usage.

![App sleep activated to optimize resource usage and spend](https://res.cloudinary.com/railway/image/upload/v1737143360/appsleep_cszmgf.png)
