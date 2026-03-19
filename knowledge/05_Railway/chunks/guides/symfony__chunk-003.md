# Deploy a Symfony App (Chunk 3/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/symfony.md
Original Path: guides/symfony.md
Section: guides
Chunk: 3/6

---

## Deploy from a GitHub repo

To deploy a Symfony app to Railway directly from GitHub, follow the steps below:

1. **Create a New Project on Railway**:
   - Go to [Railway](https://railway.com/new) to create a new project.
2. **Deploy from GitHub**:
   - Select **Deploy from GitHub repo** and choose your repository.
     - If your Railway account isn’t linked to GitHub yet, you’ll be prompted to do so.
3. **Add Environment Variables and Provision a Database Service**:
   - Click **Add Variables**, but hold off on adding anything just yet. First, proceed with the next step.
   - Right-click on the Railway project canvas or click the **Create** button, then select **Database** and choose **Add PostgreSQL**.
     - This will create and deploy a new PostgreSQL database for your project.
   - Once the database is deployed, you can return to adding the necessary environment variables:
     - `DATABASE_URL`: Set the value to `${{Postgres.DATABASE_URL}}` (this references the URL of your new Postgres database). Learn more about [referencing service variables](/variables#referencing-another-services-variable).
     - `APP_ENV=prod` - This setting informs Symfony that the app is running in a production environment, optimizing it for performance.
     - `APP_SECRET=secret` where _secret_ is your generated app secret.
     - `COMPOSER_ALLOW_SUPERUSER="1"` - This is necessary to allow Composer to run as root, enabling the plugins that Symfony requires during installation.
     - `NIXPACKS_PHP_ROOT_DIR="/app/public"` - This ensures the Nginx configuration points to the correct [root directory path to serve the app](https://nixpacks.com/docs/providers/php).
4. **Deploy the App Service**:
   - Click **Deploy** on the Railway project canvas to apply your changes.
5. **Verify the Deployment**:

   - Once the deployment completes, go to [**View logs**](/observability/logs#build--deploy-panel) to check if the server is running successfully.

   **Note:** During the deployment process, Railway will automatically [detect that it’s a PHP app via Nixpacks](https://nixpacks.com/docs/providers/php).

6. **Set Up a Public URL**:
   - Navigate to the **Networking** section under the [Settings](/overview/the-basics#service-settings) tab of your new service.
   - Click [Generate Domain](/networking/public-networking#railway-provided-domain) to create a public URL for your app.

**Note:** The next step shows how to run your Symfony app along with a database, migrations, cron jobs, and workers.
