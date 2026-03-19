# Deploy a Symfony App (Chunk 2/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/symfony.md
Original Path: guides/symfony.md
Section: guides
Chunk: 2/6

---

## Deploy from the CLI

If you have your Symfony app locally, you can follow these steps:

1. **Install the Railway CLI**:
   - [Install the CLI](/guides/cli#installing-the-cli) and [authenticate it](/guides/cli#authenticating-with-the-cli) using your Railway account.
2. **Initialize a Railway Project**:
   - Run the command below in your Symfony app directory.
     ```bash
     railway init
     ```
   - Follow the prompts to name your project.
   - After the project is created, click the provided link to view it in your browser.
3. **Add a Postgres Database Service**:
   - Run `railway add -d postgres`.
   - Hit **Enter** to add it to your project.
   - A database service will be added to your Railway project.
4. **Add a Service and Environment Variable**:
   - Run `railway add`.
   - Select `Empty Service` from the list of options.
   - In the `Enter a service name` prompt, enter `app-service`.
   - In the `Enter a variable` prompt, enter `DATABASE_URL=${{Postgres.DATABASE_URL}}`.
     - The value, `${{Postgres.DATABASE_URL}}`, references the URL of your new Postgres database. Learn more about [referencing service variables](/variables#referencing-another-services-variable).
   - Set the other environment variables: - `APP_ENV=prod` - This setting informs Symfony that the app is running in a production environment, optimizing it for performance. - `APP_SECRET=secret` where _secret_ is your generated app secret. - `COMPOSER_ALLOW_SUPERUSER="1"` - This is necessary to allow Composer to run as root, enabling the plugins that Symfony requires during installation. - `NIXPACKS_PHP_ROOT_DIR="/app/public"` - This ensures the Nginx configuration points to the correct [root directory path to serve the app](https://nixpacks.com/docs/providers/php).
     **Note:** Explore the [Railway CLI reference](/cli#add) for a variety of options.
5. **Deploy the Application**:
   - Run `railway up` to deploy your app.
     - This command will scan, compress and upload your app's files to Railway. You’ll see real-time deployment logs in your terminal.
   - Once the deployment is complete, proceed to generate a domain for the app service.
6. **Set Up a Public URL**:
   - Run `railway domain` to generate a public URL for your app.
   - Visit the new URL to see your app live in action!
