# Deploy a Nuxt App (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/nuxt.md
Original Path: guides/nuxt.md
Section: guides
Chunk: 1/3

---

# Deploy a Nuxt App

Learn how to deploy a Nuxt app to Railway with this step-by-step guide. It covers quick setup, one-click deploys, Dockerfile and other deployment strategies.

[Nuxt](https://nuxt.com) is a Vue.js framework that makes web development intuitive and powerful. You can create performant and production-grade full-stack web apps and websites with confidence.

Nuxt is known as **The Intuitive Vue Framework** because it simplifies building Vue.js applications with features like server-side rendering and easy routing.

This guide covers how to deploy a Nuxt app to Railway in four ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [From a GitHub repository](#deploy-from-a-github-repo).
3. [Using the CLI](#deploy-from-the-cli).
4. [Using a Dockerfile](#use-a-dockerfile).

Now, let's create a Nuxt app!

## Create a Nuxt app

**Note:** If you already have a Nuxt app locally or on GitHub, you can skip this step and go straight to the [Deploy Nuxt App on Railway](#deploy-the-nuxt-app-to-railway).

To create a new Nuxt app, ensure that you have [Node](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs) installed on your machine.

Run the following command in your terminal to create a new Nuxt app:

```bash
npx nuxi@latest init helloworld
```

A new Nuxt app will be provisioned for you in the `helloworld` directory.

### Run the Nuxt app locally

Next, `cd` into the directory and start the development server by running the following command:

```bash
npm run dev
```

Open your browser and go to `http://localhost:3000` to see your app.

## Deploy the Nuxt app to Railway

Railway offers multiple ways to deploy your Nuxt app, depending on your setup and preference.

### One-click deploy from a template

If you’re looking for the fastest way to get started, the one-click deploy option is ideal.

Click the button below to begin:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/lQQgLR)

It is highly recommended that [you eject from the template after deployment](/templates/deploy#eject-from-template-repository) to create a copy of the repo on your GitHub account.

**Note:** You can also choose from a [variety of Nuxt app templates](https://railway.com/templates?q=nuxt) created by the community.
