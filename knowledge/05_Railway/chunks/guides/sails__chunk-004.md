# Deploy a Sails App (Chunk 4/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/sails.md
Original Path: guides/sails.md
Section: guides
Chunk: 4/5

---

## Deploy from a GitHub repo

To deploy the Sails app to Railway, start by pushing the app to a GitHub repo. Once that’s set up, follow the steps below to complete the deployment process.

1. **Create a New Project on Railway**:
   - Go to [Railway](https://railway.com/new) to create a new project.
2. **Deploy from GitHub**:
   - Select **Deploy from GitHub repo** and choose your repository.
     - If your Railway account isn’t linked to GitHub yet, you’ll be prompted to do so.
3. **Add Environment Variables**:
   - Click **Add Variables** and configure all the necessary environment variables for your app.
4. **Deploy the App**:
   - Click **Deploy** to start the deployment process.
   - Once the deployed, a Railway [service](/services) will be created for your app, but it won’t be publicly accessible by default.
5. **Add a Database Service**:
   - Right-click on the Railway project canvas or click the **Create** button.
   - Select **Database**.
   - Select **Add PostgreSQL** from the available databases.
     - This will create and deploy a new Postgres database service for your project.
6. **Add a Redis Database Service**:
   - Right-click on the Railway project canvas or click the **Create** button.
   - Select **Database**.
   - Select **Add Redis** from the available databases.
     - This will create and deploy a new Redis database service for your project.
7. **Configure Environment Variables**:
   - Go to your app service [**Variables**](/overview/the-basics#service-variables) section and add the following:
     - `DATABASE_URL`: Set the value to `${{Postgres.DATABASE_URL}}` (this references the URL of your new Postgres database). Learn more about [referencing service variables](/variables#referencing-another-services-variable).
     - `REDIS_URL`: Set the value to `${{Redis.REDIS_URL}}` (this references the URL of your new Redis Database)
   - Use the **Raw Editor** to add any other required environment variables in one go.
8. **Modify Sails Config**:
   - Follow [steps 3 & 5 mentioned in the CLI guide](#deploy-from-the-cli).
9. **Redeploy the Service**:
   - Click **Deploy** on the Railway dashboard to apply your changes.
10. **Verify the Deployment**:
    - Once the deployment completes, go to **View logs** to check if the server is running successfully.
11. **Set Up a Public URL**:
    - Navigate to the **Networking** section under the [Settings](/overview/the-basics#service-settings) tab of your new service.
    - Click [Generate Domain](/networking/public-networking#railway-provided-domain) to create a public URL for your app.

This guide covers the main deployment options on Railway. Choose the approach that suits your setup, and start deploying your Sails apps effortlessly!

Here’s how your setup should look:

By following these steps, you’ll have a fully functional Sails app. If you run into any issues or need to make adjustments, check the logs and revisit your environment variable configurations.
