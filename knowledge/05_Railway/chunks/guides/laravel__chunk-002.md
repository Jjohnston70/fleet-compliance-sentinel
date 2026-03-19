# Deploy a Laravel App (Chunk 2/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/laravel.md
Original Path: guides/laravel.md
Section: guides
Chunk: 2/5

---

## Deploy from the CLI

If you have your Laravel app locally, you can follow these steps:

1. [Install](/cli#installing-the-cli) and [authenticate with the Railway CLI.](/cli#authenticating-with-the-cli)

2. Run `railway init` within your Laravel app root directory to create a new project on Railway.

   - Follow the steps in the prompt to give your project a name.

3. Run `railway up` to deploy.

   - The CLI will now scan, compress and upload your Laravel app files to Railway's backend for deployment.

   - Your terminal will display real-time logs as your app is being deployed on Railway.

4. Once the deployment is successful, click on **View logs** on the recent deployment on the dashboard.

   - You'll see that the server is running. However you'll also see logs prompting you to add your env variables.

5. Click on the [**Variables**](/overview/the-basics#service-variables) section of your service on the Railway dashboard.

6. Click on **Raw Editor** and add all your app environment variables.

7. Click on **Deploy** to redeploy your app.

To set up a publicly accessible URL for the service, navigate to the **Networking** section in the [Settings](/overview/the-basics#service-settings) tab of your new service and click on [Generate Domain](/networking/public-networking#railway-provided-domain).

**Note:** The next step shows how to run your Laravel app along with a database, migrations, cron jobs, and workers.
