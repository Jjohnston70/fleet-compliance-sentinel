# Deploy a SvelteKit App (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/sveltekit.md
Original Path: guides/sveltekit.md
Section: guides
Chunk: 2/3

---

### Prepare SvelteKit app for deployment

First, enable the SvelteKit Node adapter.

[SvelteKit adapters](https://svelte.dev/docs/kit/adapters) are plugins that take the built app as input and generate output for deployment. These adapters are used to run your project on deployment platforms.

Let's add the Node adapter to the app. Run the command below in your terminal:

```bash
npm i -D @sveltejs/adapter-node
```

Once it is installed, add the adapter to the app's `svelte.config.js` file.

The `svelte.config.js` file should look like this:

```js

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter(),
  },
};

```

Next, add the start script to the `package.json` file.

Svelte builds your project into a `build` directory. The server starts when the server entry point is executed, which is by default located at `build/index.js`.

Open up the `package.json` file and add the start script. Set it to `node build/index.js` like so:

```js
{
	"name": "svelteapp",
	"version": "0.0.1",
	"type": "module",
	"scripts": {
		"dev": "vite dev",
		"build": "vite build",
		"start": "node build/index.js",
		"preview": "vite preview",
		"check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
		"check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
		"format": "prettier --write .",
		"lint": "prettier --check . && eslint ."
	},
	"devDependencies": {
		"@fontsource/fira-mono": "^5.0.0",
		"@neoconfetti/svelte": "^2.0.0",
		"@sveltejs/adapter-auto": "^3.0.0",
		"@sveltejs/adapter-node": "^5.2.9",
		"@sveltejs/kit": "^2.0.0",
		"@sveltejs/vite-plugin-svelte": "^4.0.0",
		"@types/eslint": "^9.6.0",
		"autoprefixer": "^10.4.20",
		"eslint": "^9.7.0",
		"eslint-config-prettier": "^9.1.0",
		"eslint-plugin-svelte": "^2.36.0",
		"globals": "^15.0.0",
		"prettier": "^3.3.2",
		"prettier-plugin-svelte": "^3.2.6",
		"prettier-plugin-tailwindcss": "^0.6.5",
		"svelte": "^5.0.0",
		"svelte-check": "^4.0.0",
		"tailwindcss": "^3.4.9",
		"typescript": "^5.0.0",
		"typescript-eslint": "^8.0.0",
		"vite": "^5.0.3"
	}
}
```

_package.json_

Now you're ready to deploy!

## Deploy the SvelteKit app to Railway

Railway offers multiple ways to deploy your SvelteKit app, depending on your setup and preference.

### One-click deploy from a template

If you’re looking for the fastest way to get started, the one-click deploy option is ideal.

Click the button below to begin:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/svelte-kit)

It is highly recommended that [you eject from the template after deployment](/templates/deploy#eject-from-template-repository) to create a copy of the repo on your GitHub account.

**Note:** You can also choose from a [variety of Svelte app templates](https://railway.com/templates?q=sveltekit) created by the community.
