# Deploy a Laravel App (Chunk 4/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/laravel.md
Original Path: guides/laravel.md
Section: guides
Chunk: 4/5

---

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
