# Deploy a Laravel App (Chunk 3/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/laravel.md
Original Path: guides/laravel.md
Section: guides
Chunk: 3/5

---

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
