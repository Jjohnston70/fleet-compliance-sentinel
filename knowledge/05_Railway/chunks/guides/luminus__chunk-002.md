# Deploy a Clojure Luminus App (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/luminus.md
Original Path: guides/luminus.md
Section: guides
Chunk: 2/3

---

# nixpacks.toml

[start]
cmd = "java -jar $(find ./target -name '*.jar' ! -name '*SNAPSHOT*') migrate && java -jar $(find ./target -name '*.jar' ! -name '*SNAPSHOT*')"

```

Here, Nixpacks is being specifically instructed to use the following command to start the app.

The command searches for all `.jar` files in the `target` directory (where the standalone JAR file is located after the build), excludes any file with "SNAPSHOT" in its name, and passes the selected file to `java -jar` to run.

It starts by running the JAR file with the `migrate` option to apply database migrations. Once migrations are complete, it reruns the JAR file to launch the application.

## Deploy the Luminus app to Railway

Railway offers multiple ways to deploy your Clojure app, depending on your setup and preference.

### One-click deploy from a template

If you’re looking for the fastest way to get started, the one-click deploy option is ideal.

Click the button below to begin:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/DsDYI2)

It is highly recommended that [you eject from the template after deployment](/templates/deploy#eject-from-template-repository) to create a copy of the repo on your GitHub account.

**Note:** You can also choose from a [variety of Clojure app templates](https://railway.com/templates?q=clojure) created by the community.

### Deploy from the CLI

1. **Install the Railway CLI**:
   - [Install the CLI](/guides/cli#installing-the-cli) and [authenticate it](/guides/cli#authenticating-with-the-cli) using your Railway account.
2. **Initialize a Railway Project**:
   - Run the command below in your Luminus app directory.
     ```bash
     railway init
     ```
   - Follow the prompts to name your project.
   - After the project is created, click the provided link to view it in your browser.
3. **Add a Postgres Database Service**:
   - Run `railway add -d postgres`.
   - Hit **Enter** to add it to your project.
   - A database service will be added to your Railway project.
4. **Add a Service and Environment Variable**:

   - Run `railway add`.
   - Select `Empty Service` from the list of options.
   - In the `Enter a service name` prompt, enter `app-service`.
   - In the `Enter a variable` prompt, enter `DATABASE_URL=${{Postgres.DATABASE_URL}}`.
     - The value, `${{Postgres.DATABASE_URL}}`, references the URL of your new Postgres database. Learn more about [referencing service variables](/variables#referencing-another-services-variable).

   **Note:** Explore the [Railway CLI reference](/cli#add) for a variety of options.

5. **Deploy the Application**:
   - Run `railway up` to deploy your app.
     - This command will scan, compress and upload your app's files to Railway. You’ll see real-time deployment logs in your terminal.
   - Once the deployment is complete, proceed to generate a domain for the app service.
6. **Set Up a Public URL**:
   - Run `railway domain` to generate a public URL for your app.
   - Visit the new URL to see your app live in action!
