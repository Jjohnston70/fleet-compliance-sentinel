# Deploy a Ruby on Rails App (Chunk 2/7)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/rails.md
Original Path: guides/rails.md
Section: guides
Chunk: 2/7

---

## One-click deploy from a template

If you’re looking for the fastest way to get started, the one-click deploy option is ideal. It sets up a Rails app along with a Postgres database and Redis.

Click the button below to begin:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/sibk1f)

After deploying, it is recommended that you [eject from the template](/templates/deploy#eject-from-template-repository) to create a copy of the repository under your own GitHub account. This will give you full control over the source code and project.

## Deploy from the CLI

To deploy the Rails app using the Railway CLI, please follow the steps:

1. **Install the Railway CLI**:
   - [Install the CLI](/guides/cli#installing-the-cli) and [authenticate it](/guides/cli#authenticating-with-the-cli) using your Railway account.
2. **Initialize a Railway Project**:
   - Run the command below in your Rails app directory.
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

- **Note:** If you see an error about a missing `secret_key_base` for the production environment, don’t worry. You’ll fix this in the next step.

4. **Add a Database Service**:
   - Run `railway add`.
   - Select `PostgreSQL` by pressing space and hit **Enter** to add it to your project.
   - A database service will be added to your Railway project.
5. **Configure Environment Variables**:
   - Go to your app service [**Variables**](/overview/the-basics#service-variables) section and add the following:
     - `SECRET_KEY_BASE` or `RAILS_MASTER_KEY`: Set the value to the key from your local app's `config/master.key`.
     - `DATABASE_URL`: Set the value to `${{Postgres.DATABASE_PUBLIC_URL}}` (this references the URL of your new Postgres database). Learn more about [referencing service variables](/variables#referencing-another-services-variable).
   - Use the **Raw Editor** to add any other required environment variables in one go.
6. **Redeploy the Service**:
   - Click **Deploy** on the Railway dashboard to apply your changes.
7. **Verify the Deployment**:
   - Once the deployment completes, go to **View logs** to check if the server is running successfully.

**Note:** If your app has a `Dockerfile` (which newer Rails apps typically include by default), Railway will [automatically detect and use it to build](/builds/dockerfiles) your app. If not, Railway will still handle the deployment process for you.

8. **Set Up a Public URL**:
   - Navigate to the **Networking** section under the [Settings](/overview/the-basics#service-settings) tab of your new service.
   - Click [Generate Domain](/networking/public-networking#railway-provided-domain) to create a public URL for your app.
