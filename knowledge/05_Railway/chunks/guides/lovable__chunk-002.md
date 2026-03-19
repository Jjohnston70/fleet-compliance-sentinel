# Deploy a Lovable App on Railway (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/lovable.md
Original Path: guides/lovable.md
Section: guides
Chunk: 2/3

---

## Deploy from GitHub repo

Once your Lovable project is connected to GitHub, deploy it to Railway by importing the repository.

1. **Create a New Project on Railway**:
   - Go to [Railway](https://railway.com/new) to create a new project.
2. **Deploy from GitHub**:
   - Select **Deploy from GitHub repo** and choose the repository created by Lovable.
     - If your Railway account isn't linked to GitHub yet, you'll be prompted to do so.
3. **Deploy the App**:
   - Click **Deploy** to start the deployment process.
   - Railway detects the build configuration from your Lovable-generated code and provisions the necessary resources.
   - Once deployed, a Railway [service](/services) will be created for your app, but it won't be publicly accessible by default.
4. **Verify the Deployment**:
   - Once the deployment completes, go to **View logs** to check if the server is running successfully.
   - Review any build or runtime errors in the deployment logs.
5. **Set Up a Public URL**:
   - Navigate to the **Networking** section under the [Settings](/overview/the-basics#service-settings) tab of your new service.
   - Click [Generate Domain](/networking/public-networking#railway-provided-domain) to create a public URL for your app.

Your Lovable-generated application is now live on Railway.

### Environment variables

Lovable-generated applications may require environment variables for API keys, database connections, or other configuration.

**Add environment variables in Railway:**

1. Navigate to your service in Railway.
2. Go to the **Variables** tab.
3. Add the required variables as key-value pairs.
4. Railway automatically redeploys with the new configuration.

See the [Variables guide](/variables) for detailed information on managing environment variables.

## Iterate on your application

The Lovable-Railway workflow enables prompt-driven development with automatic deployment.

**Development workflow:**

1. Open your Lovable project.
2. Describe changes or new features using natural language prompts.
3. Lovable generates the code changes and updates the GitHub repository.
4. Railway detects the commit and begins redeployment automatically.
5. Monitor the deployment in Railway's logs to verify the changes deployed successfully.

**Development cycle timing:**

- Lovable to GitHub sync occurs within seconds of completing changes.
- Railway deployment time depends on build complexity, typically a few minutes.

**Handling deployment failures:**

If a deployment fails after a Lovable change:

1. Check Railway's build and deployment logs for errors.
2. Review the changes in GitHub to identify problematic code.
3. Use Lovable's prompt interface to request fixes or adjustments.
4. Lovable will push corrections to GitHub, triggering a new deployment attempt.

**Working with branches:**

By default, Lovable syncs only with the default branch (usually `main`). Railway deploys from this same branch.

Lovable offers experimental branch switching in **Settings → Account → Labs**. When enabled, you can develop features on separate branches before merging to the main branch, which then deploys to Railway.
