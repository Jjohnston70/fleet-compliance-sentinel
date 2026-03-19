# Deploy a Phoenix App with Distillery (Chunk 6/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/phoenix-distillery.md
Original Path: guides/phoenix-distillery.md
Section: guides
Chunk: 6/6

---

## Deploy from a GitHub repo

To deploy the Phoenix app to Railway, start by pushing the app to a GitHub repo. Once that’s set up, follow the steps below to complete the deployment process.

1. **Create a New Project on Railway**:
   - Go to [Railway](https://railway.com/new) to create a new project.
2. **Deploy from GitHub**:
   - Select **Deploy from GitHub repo** and choose your repository.
     - If your Railway account isn’t linked to GitHub yet, you’ll be prompted to do so.
3. **Add Environment Variables and Provision a Database Service**:
   - Click **Add Variables**, but hold off on adding anything just yet. First, proceed with the next step.
   - Right-click on the Railway project canvas or click the **Create** button, then select **Database** and choose **Add PostgreSQL**. This will create and deploy a new PostgreSQL database for your project.
   - Once the database is deployed, you can return to adding the necessary environment variables:
     - `SECRET_KEY_BASE` : Set the value to the your app's secret key. You can run `mix phx.gen.secret` locally to generate one.
     - `LANG`and `LC_CTYPE`: Set both values to `en_US.UTF-8` to ensure proper locale settings and avoid the _native name encoding of latin1 warning_.
     - `DATABASE_URL`: Set the value to `${{Postgres.DATABASE_URL}}` (this references the URL of your new Postgres database). Learn more about [referencing service variables](/variables#referencing-another-services-variable).
     - `ECTO_IPV6`: Set the value to `true` to enable your Phoenix app to connect to the database through the [IPv6 private network](/networking/private-networking#listen-on-ipv6).
4. **Deploy the App Service**:
   - Click **Deploy** on the Railway project canvas to apply your changes.
5. **Verify the Deployment**:

   - Once the deployment completes, go to [**View logs**](/observability/logs#build--deploy-panel) to check if the server is running successfully.

   **Note:** During the deployment process, Railway will automatically [detect that it’s an Elixir app](https://nixpacks.com/docs/providers/elixir).

6. **Set Up a Public URL**:
   - Navigate to the **Networking** section under the [Settings](/overview/the-basics#service-settings) tab of your new service.
   - Click [Generate Domain](/networking/public-networking#railway-provided-domain) to create a public URL for your app.

This guide covers the main deployment options on Railway. Choose the approach that suits your setup, and start deploying your Phoenix apps with Distillery effortlessly!

## Next steps

Explore these resources to learn how you can maximize your experience with Railway:

- [Monitoring](/observability)
- [Deployments](/deployments)
