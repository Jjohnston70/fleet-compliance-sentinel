# Deploy a Symfony App (Chunk 5/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/symfony.md
Original Path: guides/symfony.md
Section: guides
Chunk: 5/6

---

2. Create a Postgres Database service on the [Project Canvas.](/overview/the-basics#project--project-canvas)
   - Click on **Deploy**.
3. Create a new service on the [Project Canvas.](/overview/the-basics#project--project-canvas)
   - Name the service **App Service**, and click on [**Settings**](/overview/the-basics#service-settings) to configure it.
   - Connect your GitHub repo to the **Source Repo** in the **Source** section.
   - Add `chmod +x ./run-app.sh && sh ./run-app.sh` to the [**Custom Start Command**](/guides/start-command) in the **Deploy** section.
   - Head back to the top of the service and click on [**Variables**](/overview/the-basics#service-variables).
   - Add all the necessary environment variables required for the Symfony app especially the ones listed below.
     - `APP_ENV=prod`
     - `APP_SECRET=secret` where _secret_ is your generated app secret.
     - `COMPOSER_ALLOW_SUPERUSER="1"` - This is necessary to allow Composer to run as root, enabling the plugins that Symfony requires during installation.
     - `NIXPACKS_PHP_ROOT_DIR="/app/public"` - This ensures the Nginx configuration points to the correct [root directory path to serve the app](https://nixpacks.com/docs/providers/php).
     - `DATABASE_URL=${{Postgres.DATABASE_URL}}` (this references the URL of your Postgres database).
   - Click **Deploy**.
4. Create a new service on the [Project Canvas](/overview/the-basics#project--project-canvas).
   - Name the service **Cron Service**, and click on [**Settings**](/overview/the-basics#service-settings).
   - Connect your GitHub repo to the **Source Repo** in the **Source** section.
   - Add `chmod +x ./run-cron.sh && sh ./run-cron.sh` to the [**Custom Start Command**](/guides/start-command) in the **Deploy** section.
   - Head back to the top of the service and click on [**Variables**](/overview/the-basics#service-variables).
   - Add all the necessary environment variables especially those highlighted already in step 3.
   - Click **Deploy**.
5. Create a new service again on the [Project Canvas](/overview/the-basics#project--project-canvas).
   - Name the service **Worker Service**, and click on [**Settings**](/overview/the-basics#service-settings).
   - Connect your GitHub repo to the **Source Repo** in the **Source** section.
   - Add `chmod +x ./run-worker.sh && sh ./run-worker.sh` to the [**Custom Start Command**](/guides/start-command) in the **Deploy** section.
   - Head back to the top of the service and click on [**Variables**](/overview/the-basics#service-variables).
   - Add all the necessary environment variables especially those highlighted already in step 3.
   - Click **Deploy**.

At this point, you should have all three services deployed and connected to the Postgres Database service:

- **Cron Service**: This service should run the cron bundler Scheduler to manage scheduled tasks.

- **Worker Service**: This service should be running and ready to process jobs from the queue.

- **App Service**: This service should be running and is the only one that should have a public domain, allowing users to access your application.

_App service_

**Note:** There is a [community template](https://railway.com/template/4tnH_D) available that demonstrates this deployment approach. You can easily deploy this template and then connect it to your own GitHub repository for your application.
