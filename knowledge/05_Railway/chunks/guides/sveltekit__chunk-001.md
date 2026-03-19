# Deploy a SvelteKit App (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/sveltekit.md
Original Path: guides/sveltekit.md
Section: guides
Chunk: 1/3

---

# Deploy a SvelteKit App

Learn how to deploy a Sveltekit app to Railway with this step-by-step guide. It covers quick setup, adapter configuration, one-click deploys and other deployment strategies.

[SvelteKit](https://svelte.dev/docs/kit/introduction) is a framework for rapidly developing robust, performant web applications using Svelte.

This guide covers how to deploy a SvelteKit app to Railway in four ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [From a GitHub repository](#deploy-from-a-github-repo).
3. [Using the CLI](#deploy-from-the-cli).
4. [Using a Dockerfile](#use-a-dockerfile).

Now, let's create a SvelteKit app!

## Create a SvelteKit app

**Note:** If you already have a SvelteKit app locally or on GitHub, you can skip this step and go straight to the [Deploy SvelteKit App to Railway](#deploy-sveltekit-app-to-railway).

To create a new SvelteKit app, ensure that you have [Node](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs) installed on your machine.

Run the following command in your terminal to create a new SvelteKit app using [Vite](https://vite.dev/guide/#scaffolding-your-first-vite-project):

```bash
npx sv create svelteapp
```

Follow the prompts:

1. Select the `SvelteKit demo` template.
2. Add typechecking with Typescript.
3. Add prettier, eslint, and tailwindcss.
4. No tailwindcss plugins. Hit enter and move on.
5. Select `npm` as the package manager to install dependencies.

A new SvelteKit app will be provisioned for you in the `svelteapp` directory.

### Run the SvelteKit app locally

Next, `cd` into the directory and start the Vite development server by running the following command:

```bash
npm run dev
```

Open your browser and go to `http://localhost:5173` to see the app. You can play the demo game by visiting the `/sverdle` route.
