# Deploy an Angular App (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/angular.md
Original Path: guides/angular.md
Section: guides
Chunk: 1/3

---

# Deploy an Angular App

Learn how to deploy an Angular app to Railway with this step-by-step guide. It covers quick setup, caddy server setup, one-click deploys, Dockerfile and other deployment strategies.

[Angular](https://angular.dev) is a JavaScript web framework that empowers developers to build fast and reliable applications. It is designed to work at any scale, keep large teams productive and is proven in some of Google's largest web apps such as [Google fonts](https://fonts.google.com) and [Google Cloud](https://console.cloud.google.com).

This guide covers how to deploy an Angular app to Railway in four ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template)
2. [From a GitHub repository](#deploy-from-a-github-repo)
3. [Using the CLI](#deploy-from-the-cli)
4. [Using a Dockerfile](#use-a-dockerfile)

Now, let's create an Angular app!

## Create an Angular app

**Note:** If you already have an Angular app locally or on GitHub, you can skip this step and go straight to the [Deploy Angular App on Railway](#deploy-the-angular-app-to-railway).

To create a new Angular app, ensure that you have [Node](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs) and [Angular CLI](https://angular.dev/installation#install-angular-cli) installed on your machine.

Run the following command in your terminal to create a new Angular app:

```bash
ng new gratitudeapp
```

You'll be presented with some config options in the prompts for your project.

- Select `CSS`
- Select `Yes` for enabling Server-Side Rendering (SSR) and Static Site Generation (SSG)
- Select `Yes` for enabling Server Routing and App Engine APIs (Developer Preview)

### Run the Angular app locally

Next, `cd` into the directory and run the app.

```bash
npm start
```

Open your browser and go to `http://localhost:4200` to see your app.

## Modify start script

Before deploying, update the `package.json` file.

Angular builds the project into the `dist` directory. For server-side rendered apps, the server starts with the command: `node dist/gratitudeapp/server/server.mjs` as defined in the scripts section below:

```js
"scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "serve:ssr:gratitudeapp": "node dist/gratitudeapp/server/server.mjs"
  },
```

- The development server starts with `npm start`.
- The production server runs with `npm run serve:ssr:gratitudeapp`.

Since Railway relies on the `build` and `start` scripts to automatically build and launch applications, update the `start` script to ensure it runs the production server correctly.

Your scripts section should look like this:

```js
...
"scripts": {
    "ng": "ng",
    "dev": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "start": "node dist/gratitudeapp/server/server.mjs"
  },
...
```

Now you're good to go!

## Deploy the Angular app to Railway

Railway offers multiple ways to deploy your Angular app, depending on your setup and preference.
