# Deploy a Rust Rocket App (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/rocket.md
Original Path: guides/rocket.md
Section: guides
Chunk: 2/3

---

### One-click deploy from a template

If you’re looking for the fastest way to get started, the one-click deploy option is ideal.

Click the button below to begin:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/FkW8oU)

It is highly recommended that [you eject from the template after deployment](/templates/deploy#eject-from-template-repository) to create a copy of the repo on your GitHub account.

**Note:** You can also choose from a [variety of Rocket templates](https://railway.com/templates?q=rocket) created by the community.

### Deploy from the CLI

1. **Install the Railway CLI**:
   - [Install the CLI](/guides/cli#installing-the-cli) and [authenticate it](/guides/cli#authenticating-with-the-cli) using your Railway account.
2. **Initialize a Railway Project**:
   - Run the command below in your Rocket app directory.
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
4. **Set Up a Public URL**:

   - Navigate to the **Networking** section under the [Settings](/overview/the-basics#service-settings) tab of your new service.
   - Click [Generate Domain](/networking/public-networking#railway-provided-domain) to create a public URL for your app.

   **Note:** You'll come across a 502 error where your application doesn't respond. You'll fix that in the next step.

5. **Configure Rocket app to accept non-local connections**:
   - Rocket apps need to be configured to accept external connections by listening on the correct address, which is typically `0.0.0.0`. You can easily do this by setting the address through the environment variable.
     Run the following command to set the Rocket address to `0.0.0.0`:
     `bash
    railway variables --set "ROCKET_ADDRESS=0.0.0.0"
    `
6. **Redeploy the Service**:
   - Run `railway up` again to trigger a redeployment of the service.
7. **Verify the Deployment**:
   - Once the deployment completes, go to **View logs** to check if the server is running successfully. Access your public URL again and you should see your app working well.
