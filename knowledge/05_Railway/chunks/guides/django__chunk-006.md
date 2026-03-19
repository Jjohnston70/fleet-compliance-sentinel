# Deploy a Django App (Chunk 6/7)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/django.md
Original Path: guides/django.md
Section: guides
Chunk: 6/7

---

1. Create a Redis Database service on the [Project Canvas](/overview/the-basics#project--project-canvas) by clicking the **Create** button. Then select **Database** and choose **Add Redis**.
   - Click on **Deploy**.
2. Create a new service on the [Project Canvas](/overview/the-basics#project--project-canvas) by clicking the **Create** button. Then select **Empty service**.
   - Name the service **App Service**, and click on [**Settings**](/overview/the-basics#service-settings) to configure it.
     - **Note:** If you followed the guide from the beginning, simply rename the existing service to **App Service**.
   - Connect your GitHub repo to the **Source Repo** in the **Source** section.
   - Go to the top of the service and click on [**Variables**](/overview/the-basics#service-variables).
   - Add all the necessary environment variables required for the Django app especially the ones listed below.
     - `REDIS_URL`: Set the value to `${{Postgres.REDIS_URL}}`
     - `PGUSER`: Set the value to `${{Postgres.PGUSER}}`
     - `PGPASSWORD`: Set the value to `${{Postgres.PGPASSWORD}}`
     - `PGHOST`: Set the value to `${{Postgres.PGHOST}}`
     - `PGPORT`: Set the value to `${{Postgres.PGPORT}}`
     - `PGDATABASE`: Set the value to `${{Postgres.PGDATABASE}}` (this references the Postgres database name). Learn more about [referencing service variables](/variables#referencing-another-services-variable).
   - Click **Deploy**.
3. Create a new service on the [Project Canvas](/overview/the-basics#project--project-canvas) by clicking the **Create** button. Then select **Empty service**.
   - Name the service **Cron Service**, and click on [**Settings**](/overview/the-basics#service-settings).
   - Connect your GitHub repo to the **Source Repo** in the **Source** section.
   - Add `celery -A liftoff beat -l info --concurrency=3` to the [**Custom Start Command**](/guides/start-command) in the **Deploy** section.
     - _Note:_ `liftoff` is the name of the app. You can find the app name in your Django project’s main folder, typically in the directory containing `settings.py`.
     - The `--concurrency=3` option here means it can process up to 3 tasks in parallel. You can adjust the [concurrency level](https://docs.celeryq.dev/en/latest/userguide/workers.html#concurrency) based on your system resources. The higher the level, the more memory and resources it consumes.
   - Head back to the top of the service and click on [**Variables**](/overview/the-basics#service-variables).
   - Add all the necessary environment variables especially those highlighted already in step 2.
   - Click **Deploy**.
4. Create a new service again on the [Project Canvas](/overview/the-basics#project--project-canvas).
   - Name the service **Worker Service**, and click on [**Settings**](/overview/the-basics#service-settings).
   - Connect your GitHub repo to the **Source Repo** in the **Source** section.
   - Add `celery -A liftoff worker -l info --concurrency=3` to the [**Custom Start Command**](/guides/start-command) in the **Deploy** section.
     - _Note:_ `liftoff` is the name of the app. You can find the app name in your Django project’s main folder, typically in the directory containing `settings.py`.
     - The `--concurrency=3` option here means it can process up to 3 tasks in parallel. You can adjust the [concurrency level](https://docs.celeryq.dev/en/latest/userguide/workers.html#concurrency) based on your system resources. The higher the level, the more memory a
