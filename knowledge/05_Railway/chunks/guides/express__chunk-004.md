# Deploy an Express App (Chunk 4/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/express.md
Original Path: guides/express.md
Section: guides
Chunk: 4/4

---

### Deploy from a GitHub repo

To deploy an Express app to Railway directly from GitHub, follow the steps below:

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
4. **Deploy the App Service**:
   - Click **Deploy** on the Railway project canvas to apply your changes.
5. **Verify the Deployment**:

   - Once the deployment completes, go to [**View logs**](/observability/logs#build--deploy-panel) to check if the server is running successfully.

   **Note:** During the deployment process, Railway will automatically [detect that it's a Node.js app via Railpack](https://railpack.com/languages/node).

6. **Set Up a Public URL**:
   - Navigate to the **Networking** section under the [Settings](/overview/the-basics#service-settings) tab of your new service.
   - Click [Generate Domain](/networking/public-networking#railway-provided-domain) to create a public URL for your app.

### Use a Dockerfile

1. Create a `Dockerfile` in the Express app's root directory.
2. Add the content below to the `Dockerfile`:

   ```bash
   # Use the Node official image
   # https://hub.docker.com/_/node
   FROM node:lts

   # Create and change to the app directory.
   WORKDIR /app

   # Copy local code to the container image
   COPY . ./

   # Install packages
   RUN npm ci

   # Serve the app
   CMD ["npm", "run", "start"]
   ```

3. Either deploy via the CLI or from GitHub.

Railway automatically detects the `Dockerfile`, [and uses it to build and deploy the app.](/builds/dockerfiles)

**Note:** Railway supports also [deployment from public and private Docker images](/guides/services#deploying-a-public-docker-image).

This guide covers the main deployment options on Railway. Choose the approach that suits your setup, and start deploying your Express apps seamlessly!

## Next steps

Explore these resources to learn how you can maximize your experience with Railway:

- [Add a Database Service](/databases/build-a-database-service)
- [Monitor your app](/observability)
