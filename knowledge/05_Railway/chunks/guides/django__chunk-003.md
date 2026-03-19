# Deploy a Django App (Chunk 3/7)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/django.md
Original Path: guides/django.md
Section: guides
Chunk: 3/7

---

## Deploy from the CLI

To deploy the Django app using the Railway CLI, please follow the steps:

1. **Install the Railway CLI**:
   - [Install the CLI](/guides/cli#installing-the-cli) and [authenticate it](/guides/cli#authenticating-with-the-cli) using your Railway account.
2. **Initialize a Railway Project**:
   - Run the command below in your Django app directory.
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

   **Note:** You'll encounter an error about the PGDATABASE environment not set. Don't worry, you'll fix that in the next steps.

4. **Add a Database Service**:
   - Run `railway add`.
   - Select `PostgreSQL` by pressing space and hit **Enter** to add it to your project.
   - A database service will be added to your Railway project.
5. **Configure Environment Variables**:
   - Go to your app service [**Variables**](/overview/the-basics#service-variables) section and add the following:
     - `PGDATABASE`: Set the value to `${{Postgres.PGDATABASE}}` (this references the Postgres database name). Learn more about [referencing service variables](/variables#referencing-another-services-variable).
     - `PGUSER`: Set the value to `${{Postgres.PGUSER}}`
     - `PGPASSWORD`: Set the value to `${{Postgres.PGPASSWORD}}`
     - `PGHOST`: Set the value to `${{Postgres.PGHOST}}`
     - `PGPORT`: Set the value to `${{Postgres.PGPORT}}`
   - Use the **Raw Editor** to add any other required environment variables in one go.
6. **Redeploy the App Service**:
   - Click **Deploy** on the app service on the Railway dashboard to apply your changes.
7. **Verify the Deployment**:
   - Once the deployment completes, go to **View logs** to check if the server is running successfully.
8. **Set Up a Public URL**:
   - Navigate to the **Networking** section under the [Settings](/overview/the-basics#service-settings) tab of your new service.
   - Click [Generate Domain](/networking/public-networking#railway-provided-domain) to create a public URL for your app.
