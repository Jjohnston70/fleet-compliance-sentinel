# Deploy a Ruby on Rails App (Chunk 3/7)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/rails.md
Original Path: guides/rails.md
Section: guides
Chunk: 3/7

---

## Deploy from a GitHub repo

To deploy the Rails app to Railway, start by pushing the app to a GitHub repo. Once that’s set up, follow the steps below to complete the deployment process.

1. **Create a New Project on Railway**:
   - Go to [Railway](https://railway.com/new) to create a new project.
2. **Deploy from GitHub**:
   - Select **Deploy from GitHub repo** and choose your repository.
     - If your Railway account isn’t linked to GitHub yet, you’ll be prompted to do so.
3. **Add Environment Variables**:
   - Click **Add Variables** and configure all the necessary environment variables for your app.
     - E.g `RAILS_ENV`: Set the value to `production`.
     - E.g `SECRET_KEY_BASE` or `RAILS_MASTER_KEY`: Set the value to the key from your app's `config/master.key`.
4. **Deploy the App**:
   - Click **Deploy** to start the deployment process.
   - Once the deployed, a Railway [service](/services) will be created for your app, but it won’t be publicly accessible by default.
5. **Add a Database Service**:
   - Right-click on the Railway project canvas or click the **Create** button.
   - Select **Database**.
   - Select **Add PostgreSQL** from the available databases.
     - This will create and deploy a new Postgres database service for your project.
6. **Configure Environment Variables**:
   - Go to your app service [**Variables**](/overview/the-basics#service-variables) section and add the following:
     - `DATABASE_URL`: Set the value to `${{Postgres.DATABASE_URL}}` (this references the URL of your new Postgres database). Learn more about [referencing service variables](/variables#referencing-another-services-variable).
   - Use the **Raw Editor** to add any other required environment variables in one go.
7. **Prepare Database and Start Server**:
   - Go to your app service [**Settings**](/overview/the-basics#service-settings) section.
     - In the **Deploy** section, set `bin/rails db:prepare && bin/rails server -b ::` as the [**Custom Start Command**](/guides/start-command). This command will run your database migrations and start the server.
8. **Redeploy the Service**:
   - Click **Deploy** on the Railway dashboard to apply your changes.
9. **Verify the Deployment**:
   - Once the deployment completes, go to **View logs** to check if the server is running successfully.

**Note:** During the deployment process, Railway will automatically [detect that it’s a Rails app](https://nixpacks.com/docs/providers/ruby).

10. **Set Up a Public URL**:
    - Navigate to the **Networking** section under the [Settings](/overview/the-basics#service-settings) tab of your new service.
    - Click [Generate Domain](/networking/public-networking#railway-provided-domain) to create a public URL for your app.

This guide covers the main deployment options on Railway. Choose the approach that suits your setup, and start deploying your Rails apps effortlessly!

Next, this guide covers how to set up workers and cron jobs for your Rails app on Railway.
