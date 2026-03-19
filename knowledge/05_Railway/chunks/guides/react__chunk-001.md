# Deploy a React App (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/react.md
Original Path: guides/react.md
Section: guides
Chunk: 1/3

---

# Deploy a React App

Learn how to deploy a React app to Railway with this step-by-step guide. It covers quick setup, caddy server setup, one-click deploys and other deployment strategies.

[React](https://react.dev), also known as React.js or ReactJS, is a popular JavaScript library developed by Meta for building user interfaces, especially for web and native applications.

React simplifies the process of creating interactive and dynamic UIs by breaking them down into reusable components.

This guide covers how to deploy a React app to Railway in four ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [From a GitHub repository](#deploy-from-a-github-repo).
3. [Using the CLI](#deploy-from-the-cli).
4. [Using a Dockerfile](#use-a-dockerfile).

Now, let's create a React app!

## Create a React app

**Note:** If you already have a React app locally or on GitHub, you can skip this step and go straight to the [Deploy React App on Railway](#deploy-the-react-app-to-railway).

To create a new React app, ensure that you have [Node](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs) installed on your machine.

Run the following command in your terminal to create a new React app using [Vite](https://vite.dev/guide/#scaffolding-your-first-vite-project):

```bash
npm create vite@latest helloworld -- --template react
```

A new React app will be provisioned for you in the `helloworld` directory.

### Run the React app locally

Next, `cd` into the directory and install the dependencies.

```bash
npm install
```

Start the Vite development server by running the following command:

```bash
npm run dev
```

Open your browser and go to `http://localhost:5173` to see your app.

## Deploy the React app to Railway

Railway offers multiple ways to deploy your React app, depending on your setup and preference.

### One-click deploy from a template

If you’re looking for the fastest way to get started, the one-click deploy option is ideal. It sets up a React app with [Caddy](https://caddyserver.com) to serve the dist folder.

Click the button below to begin:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/NeiLty)

It is highly recommended that [you eject from the template after deployment](/templates/deploy#eject-from-template-repository) to create a copy of the repo on your GitHub account.

**Note:** You can also choose from a [variety of React app templates](https://railway.com/templates?q=react) created by the community.
