# Migrate from Vercel to Railway (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/migrate-from-vercel.md
Original Path: docs/platform/migrate-from-vercel.md
Section: docs
Chunk: 1/2

---

# Migrate from Vercel to Railway

Learn how to migrate your Next.js app from Vercel to Railway with this step-by-step guide. Fast, seamless, and hassle-free.

This guide demonstrates how to transition your application from Vercel to Railway's developer-centric platform. Whether you're running a simple static site or a complex full-stack application, Railway streamlines your deployment workflow.

With features like instant rollbacks, integrated observability, and seamless environment management, Railway empowers developers to focus on building great applications rather than managing infrastructure.

Railway offers -

- **Next.js Optimization**: Built-in support for all Next.js features including ISR, SSR, and API routes

- **Zero Config Deployments**: Automatic framework detection and build optimization

- **Enhanced Development Flow**: Local development with production parity

- **Collaborative Features**: Team management, deployment protection, and role-based access

- **Priority Support**: Dedicated support for Railway users

## Migration steps

Let's walk through migrating a Next.js application to Railway. For this guide, you'll use a sample e-commerce app that showcases common Next.js features and configurations.

### Deploying your application

To get started deploying your NextJS app, first create a new [project](/overview/the-basics#project--project-canvas).

- Open up the [dashboard](/overview/the-basics#dashboard--projects) → Click **New Project**.
- Choose the **GitHub repo** option.

_Railway requires a valid GitHub account to be linked. If your Railway account isn't associated with one, you will be prompted to link it._

- Search for your GitHub project and click on it.

- Choose either **Deploy Now** or **Add variables**.
  **Deploy Now** will immediately start to build and deploy your selected repo.
  **Add Variables** will bring you to your service and ask you to add variables, when done you will need to click the **Deploy** button at the top of your canvas to initiate the first deployment.
  _For brevity, choose **Deploy Now**._

When you click **Deploy Now**, Railway will create a new project for you and kick off an initial deploy after the project is created.

**Once the project is created you will land on your [Project Canvas](/overview/the-basics#project--project-canvas)**.

From here Railway will automatically -

- Detect your Next.js configuration

- Configure the appropriate Node.js version

- Build your application

- Run your application

### Environment configuration

Next.js applications often rely on environment variables for API keys, database connections, and feature flags. Here's how to transfer them -

**From Vercel -**

1. Visit your Vercel project settings

2. Navigate to the Environment Variables tab

3. Export your variables (you can copy them directly)

**To Railway -**

1. Select your service in the Project Canvas

2. Open the Variables tab

3. Use the Raw Editor for bulk variable import

4. Click Deploy to apply changes

### Domain configuration

Railway makes it simple to set up custom domains or use Railway-provided domains -

1. Open your service's Settings

2. Navigate to the Public Networking section

3. Choose between:

   - Generating a Railway service domain

   - Adding your custom domain

4. Follow the DNS configuration steps if using a custom domain
