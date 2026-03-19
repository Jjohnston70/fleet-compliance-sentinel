# Deploy a Django App (Chunk 4/7)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/django.md
Original Path: guides/django.md
Section: guides
Chunk: 4/7

---

## Deploy from a GitHub repo

To deploy the Django app to Railway, start by pushing the app to a GitHub repo. Once that’s set up, follow the steps below to complete the deployment process.

1. **Create a New Project on Railway**:
   - Go to [Railway](https://railway.com/new) to create a new project.
2. **Deploy from GitHub**:
   - Select **Deploy from GitHub repo** and choose your repository.
     - If your Railway account isn’t linked to GitHub yet, you’ll be prompted to do so.
3. **Add Environment Variables**:

   - Click **Add Variables** and configure all the necessary environment variables for your app.
     - `PGDATABASE`: Set the value to `${{Postgres.PGDATABASE}}` (this references the Postgres database name). Learn more about [referencing service variables](/variables#referencing-another-services-variable).
     - `PGUSER`: Set the value to `${{Postgres.PGUSER}}`
     - `PGPASSWORD`: Set the value to `${{Postgres.PGPASSWORD}}`
     - `PGHOST`: Set the value to `${{Postgres.PGHOST}}`
     - `PGPORT`: Set the value to `${{Postgres.PGPORT}}`

   **Note:** The Postgres Database service isn't set up yet. You'll add that soon.

4. **Add a Database Service**:
   - Right-click on the Railway project canvas or click the **Create** button.
   - Select **Database**.
   - Select **Add PostgreSQL** from the available databases.
     - This will create and deploy a new Postgres database service for your project.
5. **Deploy the App**:
   - Click **Deploy** to start the deployment process and apply all changes.
   - Once deployed, a Railway [service](/services) will be created for your app, but it won’t be publicly accessible by default.
6. **Verify the Deployment**:

   - Once the deployment completes, go to **View logs** to check if the server is running successfully.

   **Note:** During the deployment process, Railway will automatically [detect that it’s a Django app](https://nixpacks.com/docs/providers/python).

7. **Set Up a Public URL**:
   - Navigate to the **Networking** section under the [Settings](/overview/the-basics#service-settings) tab of your new service.
   - Click [Generate Domain](/networking/public-networking#railway-provided-domain) to create a public URL for your app.

This guide covers the main deployment options on Railway. Choose the approach that suits your setup, and start deploying your Django apps effortlessly!

**Note:** The next step shows how to configure and run your Django app along with Celery and Celery beat.
