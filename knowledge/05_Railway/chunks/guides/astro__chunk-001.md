# Deploy an Astro App (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/astro.md
Original Path: guides/astro.md
Section: guides
Chunk: 1/3

---

# Deploy an Astro App

Learn how to deploy an Astro app to Railway with this step-by-step guide. It covers quick setup, server side rendering, one-click deploys, Dockerfile and other deployment strategies.

[Astro](https://astro.build) is the web framework for content-driven websites. It's a JavaScript framework optimized for building fast, content-driven websites. It also supports every major UI framework, allowing you to bring in your existing components and benefit from Astro's optimized client build performance.

This guide covers how to deploy an Astro app to Railway in four ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [From a GitHub repository](#deploy-from-a-github-repo).
3. [Using the CLI](#deploy-from-the-cli).
4. [Using a Dockerfile](#use-a-dockerfile).

Now, let's create an Astro app!

## Create an Astro app

**Note:** If you already have an Astro app locally or on GitHub, you can skip this step and go straight to the [Deploy Astro Apps on Railway](#deploy-the-astro-app-to-railway).

To create a new Astro app, ensure that you have [Node](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs) installed on your machine.

Run the following command in your terminal to create a new Astro app:

```bash
npm create astro@latest
```

Follow the prompts and provide a directory name, such as `blog`, where you'd like to set up your app.

When prompted to choose how you'd like to start your project, select **Use blog template**. For TypeScript, choose **Yes**.

For the remaining options, select the defaults and press Enter. All necessary dependencies will then be installed.

A new Astro app will be provisioned for you in the `blog` directory.

### Run the Astro app locally

Enter your project directory using `cd blog`.

Start the local dev server by running the following command:

```bash
npm run dev
```

Open your browser and go to `http://localhost:4321` to see your app.

### Enable server side rendering (SSR)

Astro has several [SSR adapters](https://docs.astro.build/en/guides/server-side-rendering/). These adapters are used to run your project on the server and handle SSR requests.

Add the Node adapter to enable SSR in your blog project.

Run the command below in your terminal:

```bash
npx astro add node
```

Select **Yes** at the prompt to proceed. The Node adapter will be installed, and your Astro config file will be updated accordingly.

Open up the `astro.config.mjs` file:

```js
// @ts-check

// https://astro.build/config
  site: "https://example.com",
  integrations: [mdx(), sitemap()],
  output: "server",

  adapter: node({
    mode: "standalone",
  }),
});
```

In the config file, `output` is set to `server`, meaning every page in the app is server-rendered by default.

For mostly static sites, set `output` to `hybrid`. This allows you to add `export const prerender = false` to any file that needs to be server-rendered on demand.
