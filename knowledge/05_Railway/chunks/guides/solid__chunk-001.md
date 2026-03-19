# Deploy a SolidJS App (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/solid.md
Original Path: guides/solid.md
Section: guides
Chunk: 1/3

---

# Deploy a SolidJS App

Learn how to deploy a SolidJS app to Railway with this step-by-step guide. It covers quick setup, one-click deploys and other deployment strategies.

[SolidJS](https://www.solidjs.com) is a modern JavaScript library for building responsive and high-performing user interfaces for web applications.

It uses fine-grained reactivity, meaning it updates only when the data your app actually depends on changes. This minimizes unnecessary work, leading to faster load times and a seamless user experience.

This guide covers how to deploy a Solid app to Railway in four ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [From a GitHub repository](#deploy-from-a-github-repo).
3. [Using the CLI](#deploy-from-the-cli).
4. [Using a Dockerfile](#use-a-dockerfile).

Now, let's create a Solid app!

## Create a Solid app

**Note:** If you already have a Solid app locally or on GitHub, you can skip this step and go straight to the [Deploy Solid App on Railway](#deploy-the-solid-app-to-railway).

To create a new Solid app, ensure that you have [Node](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs) installed on your machine.

Run the following command in your terminal to create a new Solid app from a template:

```bash
npx degit solidjs/templates/js solidjsapp
```

A new Solid app will be provisioned for you in the `solidjsapp` directory.

### Run the Solid app locally

Next, `cd` into the directory and install the dependencies.

```bash
npm install
```

Start the Vite development server by running the following command:

```bash
npm run dev
```

Open your browser and go to `http://localhost:3000` to see your app.

## Deploy the Solid app to Railway

Railway offers multiple ways to deploy your Solid app, depending on your setup and preference.

### One-click deploy from a template

If you’re looking for the fastest way to get started, the one-click deploy option is ideal.

Click the button below to begin:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/w5OSVq)

It is highly recommended that [you eject from the template after deployment](/templates/deploy#eject-from-template-repository) to create a copy of the repo on your GitHub account.

### Deploy from the CLI

1. **Install the Railway CLI**:
   - [Install the CLI](/guides/cli#installing-the-cli) and [authenticate it](/guides/cli#authenticating-with-the-cli) using your Railway account.
2. **Initialize a Railway Project**:
   - Run the command below in your Solid app directory.
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
