Title: Deploy a Laravel App
Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/laravel.md
Original Path: guides/laravel.md
Section: guides

---

# Deploy a Laravel App

Learn how to deploy a Laravel app to Railway with this step-by-step guide. It covers quick setup, private networking, database integration, one-click deploys and other deployment strategies.

[Laravel](https://laravel.com) is a PHP framework designed for web artisans who value simplicity and elegance in their code. It stands out for its clean and expressive syntax, and offers built-in tools to handle many common tasks found in modern web applications, making development smoother and more enjoyable.

This guide covers how to deploy a Laravel app on Railway in three ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [From a GitHub repository](#deploy-from-a-github-repo).
3. [Using the CLI](#deploy-from-the-cli).

## One-click deploy from a template

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/fWEWWf)

This template sets up a basic Laravel application along with a Postgres database on Railway. You can also choose from a [variety of Laravel app templates](https://railway.com/templates?q=laravel) created by the community.

It is highly recommended that [you eject from the template after deployment](/templates/deploy#eject-from-template-repository) to create a copy of the repo on your GitHub account.

## Deploy from a GitHub repo

To deploy a Laravel app on GitHub to Railway, follow the steps below:

1. Create a [New Project.](https://railway.com/new)

2. Click **Deploy from GitHub repo**.

3. Select your GitHub repo.

   - Railway requires a valid GitHub account to be linked. If your Railway account isn't associated with one, you will be prompted to link it.

4. Click **Add Variables**.

   - Add all your app environment variables.

5. Click **Deploy**.

Once the deployment is successful, a Railway [service](/services) will be created for you. By default, this service will not be publicly accessible.

**Note:** Railway will automatically detect that it's a Laravel app during [deploy and run your app via php-fpm and nginx](https://nixpacks.com/docs/providers/php).

To set up a publicly accessible URL for the service, navigate to the **Networking** section in the [Settings](/overview/the-basics#service-settings) tab of your new service and click on [Generate Domain](/networking/public-networking#railway-provided-domain).

**Note**: [Jump to the **Set Up Database, Migrations, Crons and Workers** section](#deploy-via-custom-scripts) to learn how to run your Laravel app along with a Postgres(or MySQL) database, cron jobs, and workers.

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

## Set up database, migrations, crons and workers

This setup deploys your Laravel app on Railway, ensuring that your database, scheduled tasks (crons), and queue workers are all fully operational.

The deployment structure follows a "majestic monolith" architecture, where the entire Laravel app is managed as a single codebase but split into four separate services on Railway:

- **App Service**: Handles HTTP requests and user interactions.

- **Cron Service**: Manages scheduled tasks (e.g., sending emails or running reports).

- **Worker Service**: Processes background jobs from the queue.

- **Database Service**: Stores and retrieves your application's data.

_My Majestic Monolith Laravel app_

Please follow these steps to get started:

1. Create four bash scripts in the `railway` directory of your Laravel app: `init-app.sh`, `run-worker.sh`, and `run-cron.sh`.

   These scripts will contain the commands needed to deploy and run the app, worker, and cron services for your Laravel app on Railway.

   - Add the content below to the `railway/init-app.sh` file:

     **Note:** You can add any additional commands to the script that you want to run each time your app service is built.

     ```bash
     #!/bin/bash
     # Make sure this file has executable permissions, run `chmod +x railway/init-app.sh`

     # Exit the script if any command fails
     set -e

     # Run migrations
     php artisan migrate --force

     # Clear cache
     php artisan optimize:clear

     # Cache the various components of the Laravel application
     php artisan config:cache
     php artisan event:cache
     php artisan route:cache
     php artisan view:cache
     ```

   - Add the content below to the `railway/run-worker.sh` file:

     ```bash
     #!/bin/bash
     # Make sure this file has executable permissions, run `chmod +x railway/run-worker.sh`

     # This command runs the queue worker.
     # An alternative is to use the php artisan queue:listen command
     php artisan queue:work
     ```

   - Add the content below to the `railway/run-cron.sh` file:

     ```bash
     #!/bin/bash
     # Make sure this file has executable permissions, run `chmod +x railway/run-cron.sh`

     # This block of code runs the Laravel scheduler every minute
     while [ true ]
         do
             echo "Running the scheduler..."
             php artisan schedule:run --verbose --no-interaction &
             sleep 60
         done
     ```

2. Create a Postgres Database service on the [Project Canvas.](/overview/the-basics#project--project-canvas)

   - Click on **Deploy**.

3. Create a new service on the [Project Canvas.](/overview/the-basics#project--project-canvas)

   - Name the service **App service**, and click on [**Settings**](/overview/the-basics#service-settings) to configure it.

   - Connect your GitHub repo to the **Source Repo** in the **Source** section.

   - Add `npm run build` to the **Custom Build Command** in the [**Build**](/builds/build-configuration#customize-the-build-command) section.

   - Add `chmod +x ./railway/init-app.sh && sh ./railway/init-app.sh` to the [**Pre-Deploy Command**](/deployments/pre-deploy-command) in the **Deploy** section.

   - Head back to the top of the service and click on [**Variables**](/overview/the-basics#service-variables).

   - Add all the necessary environment variables required for the Laravel app especially the ones listed below.

     - `APP_KEY`: Set the value to what you get from the `php artisan key:generate` command.

     - `DB_CONNECTION`: Set the value to `pgsql`.

     - `QUEUE_CONNECTION`: Set the value to `database`.

     - `DB_URL`: Set the value to `${{Postgres.DATABASE_URL}}` (this references the URL of your new Postgres database). Learn more about [referencing service variables](/variables#referencing-another-services-variable).

   - Click **Deploy**.

4. Create a new service on the [Project Canvas](/overview/the-basics#project--project-canvas).

   - Name the service **cron service**, and click on [**Settings**](/overview/the-basics#service-settings).

   - Connect your GitHub repo to the **Source Repo** in the **Source** section.

   - Add `chmod +x ./railway/run-cron.sh && sh ./railway/run-cron.sh` to the [**Custom Start Command**](/deployments/start-command) in the **Deploy** section.

   - Head back to the top of the service and click on [**Variables**](/overview/the-basics#service-variables).

   - Add all the necessary environment variables especially those highlighted already in step 3.

   - Click **Deploy**.

5. Create a new service again on the [Project Canvas](/overview/the-basics#project--project-canvas).

   - Name the service **worker service**, and click on [**Settings**](/overview/the-basics#service-settings).

   - Connect your GitHub repo to the **Source Repo** in the **Source** section.

   - Add `chmod +x ./railway/run-worker.sh && sh ./railway/run-worker.sh` to the [**Custom Start Command**](/deployments/start-command) in the **Deploy** section.

   - Head back to the top of the service and click on [**Variables**](/overview/the-basics#service-variables).

   - Add all the necessary environment variables especially those highlighted already in step 3.

   - Click **Deploy**.

At this point, you should have all three services deployed and connected to the Postgres Database service:

- **Cron Service**: This service should run the Laravel Scheduler to manage scheduled tasks.

- **Worker Service**: This service should be running and ready to process jobs from the queue.

- **App Service**: This service should be running and is the only one that should have a public domain, allowing users to access your application.

_App service_

**Note:** There is a [community template](https://railway.com/template/Gkzn4k) available that demonstrates this deployment approach. You can easily deploy this template and then connect it to your own GitHub repository for your application.

## Logging

Laravel, by default, writes logs to a directory on disk. However, on Railway’s ephemeral filesystem, this setup won’t persist logs.

To ensure logs and errors appear in Railway’s console or with `railway logs`, update the following environment variables:

- `LOG_CHANNEL`: Set the value to `stderr`.

- `LOG_STDERR_FORMATTER`: Set the value to `\Monolog\Formatter\JsonFormatter` in order to have [Structured logs](/observability/logs#structured-logs).

You can set variables via the Railway dashboard or CLI as shown:
```bash
railway variables --set "LOG_CHANNEL=stderr" --set "LOG_STDERR_FORMATTER=\Monolog\Formatter\JsonFormatter"
```

## Can I deploy with Laravel sail?

You may be thinking about using [Laravel Sail](https://laravel.com/docs/11.x/sail), which is the standard approach for deploying Laravel applications with Docker. At its core, Sail relies on a `docker-compose.yml` file to manage the environment.

However, it's important to note that Railway currently does not support Docker Compose.

## Next steps

Explore these resources to learn how you can maximize your experience with Railway:

- [Monitoring](/observability)
- [Deployments](/deployments)
