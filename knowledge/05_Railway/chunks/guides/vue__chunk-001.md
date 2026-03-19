# Deploy a Vue App (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/vue.md
Original Path: guides/vue.md
Section: guides
Chunk: 1/3

---

# Deploy a Vue App

Learn how to deploy a Vue app to Railway with this step-by-step guide. It covers quick setup, caddy server setup, one-click deploys, Dockerfile and other deployment strategies.

[Vue](https://vuejs.org), also known as Vue.js or VueJS, is a popular JavaScript library for building snappy, performant and versatile user interfaces for web applications.

Vue prides itself as **The Progressive JavaScript Framework**.

This guide covers how to deploy a Vue app to Railway in four ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [From a GitHub repository](#deploy-from-a-github-repo).
3. [Using the CLI](#deploy-from-the-cli).
4. [Using a Dockerfile](#use-a-dockerfile).

Now, let's create a Vue app!

## Create a Vue app

**Note:** If you already have a Vue app locally or on GitHub, you can skip this step and go straight to the [Deploy Vue App on Railway](#deploy-the-vue-app-to-railway).

To create a new Vue app, ensure that you have [Node](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs) installed on your machine.

Run the following command in your terminal to create a new Vue app using [Vite](https://vite.dev/guide/#scaffolding-your-first-vite-project):

```bash
npm create vue@latest
```

You'll be presented with choices for different options in the prompts. Give the app a name, `helloworld` and answer `Yes` to the other options or select what you want.

A new Vue app will be provisioned for you in the `helloworld` directory.

### Run the Vue app locally

Next, `cd` into the directory and install the dependencies.

```bash
npm install
```

Start the Vite development server by running the following command:

```bash
npm run dev
```

Open your browser and go to `http://localhost:5173` to see your app.

## Deploy the Vue app to Railway

Railway offers multiple ways to deploy your Vue app, depending on your setup and preference.

### One-click deploy from a template

If you’re looking for the fastest way to get started, the one-click deploy option is ideal. It sets up a Vue app with [Caddy](https://caddyserver.com) to serve the dist folder.

Click the button below to begin:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/Qh0OAU)

It is highly recommended that [you eject from the template after deployment](/templates/deploy#eject-from-template-repository) to create a copy of the repo on your GitHub account.

**Note:** You can also choose from a [variety of Vue app templates](https://railway.com/templates?q=vue) created by the community.
