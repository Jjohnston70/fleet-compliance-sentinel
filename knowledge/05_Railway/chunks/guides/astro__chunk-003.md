# Deploy an Astro App (Chunk 3/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/astro.md
Original Path: guides/astro.md
Section: guides
Chunk: 3/3

---

### Deploy from a GitHub repo

To deploy an Astro app to Railway directly from GitHub, follow the steps below:

1. **Create a New Project on Railway**:
   - Go to [Railway](https://railway.com/new) to create a new project.
2. **Deploy from GitHub**:
   - Select **Deploy from GitHub repo** and choose your repository.
     - If your Railway account isn’t linked to GitHub yet, you’ll be prompted to do so.
3. **Deploy the App**:
   - Click **Deploy** to start the deployment process.
   - Once the deployed, a Railway [service](/services) will be created for your app, but it won’t be publicly accessible by default.
4. **Verify the Deployment**:
   - Once the deployment completes, go to **View logs** to check if the server is running successfully.
5. **Set Up a Public URL**:
   - Navigate to the **Networking** section under the [Settings](/overview/the-basics#service-settings) tab of your new service.
   - Click [Generate Domain](/networking/public-networking#railway-provided-domain) to create a public URL for your app.

### Use a Dockerfile

1. Create a `Dockerfile` in the `blog` or Astro app's root directory.
2. Add the content below to the `Dockerfile`:

   ```bash
   # Use the Node alpine official image
   # https://hub.docker.com/_/node
   FROM node:lts-alpine

   # Create and change to the app directory.
   WORKDIR /app

   # Copy the files to the container image
   COPY package*.json ./

   # Install packages
   RUN npm ci

   # Copy local code to the container image.
   COPY . ./

   # Build the app.
   RUN npm run build

   # Serve the app
   CMD ["npm", "run", "start"]
   ```

3. Either deploy via the CLI or from GitHub.

Railway automatically detects the `Dockerfile`, [and uses it to build and deploy the app.](/builds/dockerfiles)

**Note:** Railway supports also [deployment from public and private Docker images](/guides/services#deploying-a-public-docker-image).

This guide covers the main deployment options on Railway. Choose the approach that suits your setup, and start deploying your Astro apps seamlessly!

## Next steps

Explore these resources to learn how you can maximize your experience with Railway:

- [Add a Database Service](/databases/build-a-database-service)
- [Monitor your app](/observability)
