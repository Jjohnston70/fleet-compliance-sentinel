# Deploy a Symfony App (Chunk 4/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/symfony.md
Original Path: guides/symfony.md
Section: guides
Chunk: 4/6

---

## Set up database, migrations, crons and workers

This setup deploys your Symfony app on Railway, ensuring that your database, scheduled tasks (crons), and queue workers are all fully operational.

The deployment structure follows a "majestic monolith" architecture, where the entire Symfony app is managed as a single codebase but split into four separate services on Railway:

- **App Service**: Handles HTTP requests and user interactions.
- **Cron Service**: Manages scheduled tasks (e.g., sending emails or running reports).
- **Worker Service**: Processes background jobs from the queue.
- **Database Service**: Stores and retrieves your application's data.

_My Majestic Monolith Symfony app_

Please follow these steps to get started:

1. Create three bash scripts in the root directory of your Symfony app: `run-app.sh`, `run-worker.sh`, and `run-cron.sh`.

   These scripts will contain the commands needed to deploy and run the app, worker, and cron services for your Symfony app on Railway.

   - Add the content below to the `run-app.sh` file:

     **Note:** This is required to start your app service after the build phase is complete. This script will execute the migrations and then start the Nginx server.

     ```bash
     #!/bin/bash
     # Make sure this file has executable permissions, run `chmod +x run-app.sh`
     # Run migrations, process the Nginx configuration template and start Nginx
     php bin/console doctrine:migrations:migrate --no-interaction && node /assets/scripts/prestart.mjs /assets/nginx.template.conf /nginx.conf && (php-fpm -y /assets/php-fpm.conf & nginx -c /nginx.conf)
     ```

   - Add the content below to the `run-worker.sh` file. This script will run the queue worker:

     ```bash
     #!/bin/bash
     # Make sure this file has executable permissions, run `chmod +x run-worker.sh`

     # This command runs the queue worker.
     php bin/console messenger:consume async --time-limit=3600 --memory-limit=128M &
     ```

   - Symfony doesn't natively include a scheduler. So, please install the [CronBundle](https://github.com/Cron/Symfony-Bundle) to define and run scheduled tasks. With that set up, add the content below to the `run-cron.sh` file:

     ```bash
     #!/bin/bash
     # Make sure this file has executable permissions, run `chmod +x run-cron.sh`

     # This block of code runs the scheduler every minute
     while [ true ]
         do
             echo "Running the scheduler..."
             php bin/console cron:start [--blocking] --no-interaction &
             sleep 60
         done
     ```
