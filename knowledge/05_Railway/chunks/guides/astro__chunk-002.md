# Deploy an Astro App (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/astro.md
Original Path: guides/astro.md
Section: guides
Chunk: 2/3

---

### Modify start script and Astro config

Astro builds your project into a `dist` directory. In `standalone` mode, a server starts when the server entry point is executed, which is by default located at `./dist/server/entry.mjs`.

In this mode, the server handles file serving as well as page and API routes.

Open up the `package.json` file and modify the start script from `astro dev` to `node ./dist/server/entry.mjs`.

```js
{
    "name": "astroblog",
    "type": "module",
    "version": "0.0.1",
    "scripts": {
        "dev": "astro dev",
        "start": "node ./dist/server/entry.mjs",
        "build": "astro check && astro build",
        "preview": "astro preview",
        "astro": "astro"
    },
    "dependencies": {
        "@astrojs/check": "^0.9.4",
        "@astrojs/mdx": "^3.1.8",
        "@astrojs/node": "^8.3.4",
        "@astrojs/rss": "^4.0.9",
        "@astrojs/sitemap": "^3.2.1",
        "astro": "^4.16.6",
        "typescript": "^5.6.3"
    }
}
```

Open the `astro.config.mjs` file and configure the server to run on host `0.0.0.0` by adding the following block inside the `defineConfig` function.

```js
...
server: {
    host: '0.0.0.0'
},
```

Your app needs to listen on either `0.0.0.0` or `::` to accept traffic. If not configured properly, you'll encounter a 502 error.

## Deploy the Astro app to Railway

Railway offers multiple ways to deploy your Astro app, depending on your setup and preference.

### One-click deploy from a template

If you’re looking for the fastest way to get started, the one-click deploy option is ideal.

Click the button below to begin:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/Ic0JBh)

It is highly recommended that [you eject from the template after deployment](/templates/deploy#eject-from-template-repository) to create a copy of the repo on your GitHub account.

**Note:** You can also choose from a [variety of Astro app templates](https://railway.com/templates?q=astro) created by the community.

### Deploy from the CLI

1. **Install the Railway CLI**:
   - [Install the CLI](/guides/cli#installing-the-cli) and [authenticate it](/guides/cli#authenticating-with-the-cli) using your Railway account.
2. **Initialize a Railway Project**:
   - Run the command below in your Vue app directory.
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
