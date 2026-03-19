# Deploy an Express App (Chunk 1/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/express.md
Original Path: guides/express.md
Section: guides
Chunk: 1/4

---

# Deploy an Express App

Learn how to deploy an Express app to Railway with one-click templates, GitHub, CLI, or Dockerfile. This guide covers setup, private networking, database integration, and deployment strategies.

[Express](https://expressjs.com) is a fast and flexible web application framework for Node.js that provides a simple and minimalistic approach to building web servers and APIs. It is known for its speed and unopinionated nature, allowing developers to structure their applications as they see fit while offering powerful features.

This guide covers how to deploy an Express app to Railway in four ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [From a GitHub repository](#deploy-from-a-github-repo).
3. [Using the CLI](#deploy-from-the-cli).
4. [Using a Dockerfile](#use-a-dockerfile).

Now, let's create an Express app!

## Create an Express app

**Note:** If you already have an Express app locally or on GitHub, you can skip this step and go straight to the [Deploy Express App to Railway](#deploy-the-express-app-to-railway).

To create a new Express app, ensure that you have [Node](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs) installed on your machine.

Create a directory, `helloworld`, and `cd` into it.

Run the following command in your terminal to create a new Express app within the `helloworld` directory:

```bash
npx express-generator --view=pug
```

A new Express app will be provisioned for you in the `helloworld` directory using [pug](https://pugjs.org/api/getting-started.html) as the view engine.

### Run the Express app locally

Run `npm install` to install all the dependencies.

Next, start the app by running the following command:

```bash
npm start
```

Launch your browser and navigate to `http://localhost:3000` to view the app.

If you'd prefer to run the app on a different port, simply use the command `PORT=8080 npm start` in the terminal.

Afterward, you can access the app at `http://localhost:8080`.
