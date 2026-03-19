# Deploy a Remix App (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/remix.md
Original Path: guides/remix.md
Section: guides
Chunk: 1/2

---

# Deploy a Remix App

Learn how to deploy a Remix app to Railway with this step-by-step guide. It covers quick setup, one-click deploys, Dockerfile and other deployment strategies.

[Remix](https://remix.run) is a full-stack web framework that empowers you to build fast, elegant, and resilient user experiences by focusing on the interface and working seamlessly with web standards. Your users will enjoy every moment spent with your product.

This guide covers how to deploy a Remix app to Railway in four ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [From a GitHub repository](#deploy-from-a-github-repo).
3. [Using the CLI](#deploy-from-the-cli).
4. [Using a Dockerfile](#use-a-dockerfile).

Now, let's create a Remix app!

## Create a Remix app

**Note:** If you already have a Remix app locally or on GitHub, you can skip this step and go straight to the [Deploy Remix App on Railway](#deploy-the-remix-app-to-railway).

To create a new Remix app, ensure that you have [Node](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs) installed on your machine.

Run the following command in your terminal to create a new Remix app:

```bash
npx create-remix@latest
```

Follow the prompts by giving a directory name, like `helloworld`, where you want your app to be set up. When asked, select **Yes** to automatically install all the necessary dependencies.

A new Remix app will be provisioned for you in the `helloworld` directory.

### Run the Remix app locally

Start the Vite development server by running the following command:

```bash
npm run dev
```

Open your browser and go to `http://localhost:5173` to see your app.

## Deploy the Remix app to Railway

Railway offers multiple ways to deploy your Remix app, depending on your setup and preference.

### One-click deploy from a template

If you’re looking for the fastest way to get started, the one-click deploy option is ideal.

Click the button below to begin:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/remix)

It is highly recommended that [you eject from the template after deployment](/templates/deploy#eject-from-template-repository) to create a copy of the repo on your GitHub account.

**Note:** You can also choose from a [variety of Remix app templates](https://railway.com/templates?q=remix) created by the community.

### Deploy from the CLI

1. **Install the Railway CLI**:
   - [Install the CLI](/guides/cli#installing-the-cli) and [authenticate it](/guides/cli#authenticating-with-the-cli) using your Railway account.
2. **Initialize a Railway Project**:
   - Run the command below in your Vue app directory.
     ```bash
     railway init
     ```
   - Follow the prompts to name your project.
   - After the project is created, click the provided link to view it in your browser.
3. **Deploy the Application**:
   - Use the command below to deploy your app:
     ```bash
     railway up
     ```
   - This command will scan, compress and upload your app's files to Railway. You’ll see real-time deployment logs in your terminal.
   - Once the deployment completes, go to **View logs** to check if the service is running successfully.
4. **Set Up a Public URL**:
   - Navigate to the **Networking** section under the [Settings](/overview/the-basics#service-settings) tab of your new service.
   - Click [Generate Domain](/networking/public-networking#railway-provided-domain) to create a public URL for your app.
