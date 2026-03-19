# Deploy a Sails App (Chunk 1/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/sails.md
Original Path: guides/sails.md
Section: guides
Chunk: 1/5

---

# Deploy a Sails App

Learn how to deploy a Sails app to Railway with this step-by-step guide. It covers quick setup, database integration, the Boring JavaScript stack, one-click deploys and other deployment strategies.

[Sails](https://sailsjs.com) is a MVC framework for Node.js. It is designed to emulate the familiar MVC pattern of frameworks like Ruby on Rails, but with support for the requirements of modern apps: data-driven APIs with a scalable, service-oriented architecture.

Sails makes it easy to build custom, enterprise-grade Node.js apps.

## Create a Sails app

**Note:** If you already have a Sails app locally or on GitHub, you can skip this step and go straight to the [Deploy Sails App on Railway](#deploy-sails-app-on-railway).

To create a new Sails app, ensure that you have [Node](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs) installed on your machine.

Run the following command in your terminal to install Sails:

```bash
npm install sails -g
```

Next, run the command below to create a new Sails app

```bash
sails new workapp
```

Select `Web App` as the template for your new Sails app. Once the dependencies have been installed, `cd` into the `workapp` directory and run `sails lift` to start your app.

Open your browser and go to `http://localhost:1337` to see your app.

Now, let's deploy to Railway!

## Deploy Sails app on Railway

Railway offers multiple ways to deploy your Sails app, depending on your setup and preference. Choose any of the following methods:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [Using the CLI](#deploy-from-the-cli).
3. [From a GitHub repository](#deploy-from-a-github-repo).

## One-click deploy from a template

If you’re looking for the fastest way to get started, the one-click deploy option is ideal. It sets up a Sails app along with a Postgres database and Redis.

Click the button below to begin:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/t3sAEH)

After deploying, it is recommended that you [eject from the template](/templates/deploy#eject-from-template-repository) to create a copy of the repository under your own GitHub account. This will give you full control over the source code and project.
