# Deploy a Phoenix App (Chunk 3/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/phoenix.md
Original Path: guides/phoenix.md
Section: guides
Chunk: 3/4

---

## Deploy from the CLI

To deploy the Phoenix app using the Railway CLI, please follow the steps:

1. **Install the Railway CLI**:
   - [Install the CLI](/guides/cli#installing-the-cli) and [authenticate it](/guides/cli#authenticating-with-the-cli) using your Railway account.
2. **Initialize a Railway Project**:
   - Run the command below in your Phoenix app directory.
     ```bash
     railway init
     ```
   - Follow the prompts to name your project.
   - After the project is created, click the provided link to view it in your browser.
3. **Deploy the Application**:

   - Use the command below to deploy your app:
     ```bash
     railway up
     ```
   - This command will scan, compress and upload your app's files to Railway. You’ll see real-time deployment logs in your terminal.

   **Note:** You might encounter an error––`warning: the VM is running with native name encoding of latin1 which` `may cause Elixir to malfunction as it expects utf8....`. Don’t worry, you’ll address this in the next step.

4. **Add a Database Service**:
   - Run `railway add`.
   - Select `PostgreSQL` by pressing space and hit **Enter** to add it to your project.
   - A database service will be added to your Railway project.
5. **Configure Environment Variables**:
   - Go to your app service [**Variables**](/overview/the-basics#service-variables) section and add the following:
     - `SECRET_KEY_BASE` : Set the value to the your app's secret key. You can run `mix phx.gen.secret` locally to generate one.
     - `LANG`and `LC_CTYPE`: Set both values to `en_US.UTF-8`. This sets your app's locale and gets rid of the _native name encoding of latin1_ warning.
     - `DATABASE_URL`: Set the value to `${{Postgres.DATABASE_URL}}` (this references the URL of your new Postgres database). Learn more about [referencing service variables](/variables#referencing-another-services-variable).
     - `ECTO_IPV6`: Set the value to `true` to enable your Phoenix app to connect to the database through the [IPv6 private network](/networking/private-networking#listen-on-ipv6).
   - Use the **Raw Editor** to add any other required environment variables in one go.
6. **Redeploy the Service**:
   - Click **Deploy** on the Railway Project Canvas to apply your changes.
7. **Verify the Deployment**:
   - Once the deployment completes, go to [**View logs**](/observability/logs#build--deploy-panel) to check if the server is running successfully.
8. **Set Up a Public URL**:
   - Navigate to the **Networking** section under the [Settings](/overview/the-basics#service-settings) tab of your new service.
   - Click [Generate Domain](/networking/public-networking#railway-provided-domain) to create a public URL for your app.
