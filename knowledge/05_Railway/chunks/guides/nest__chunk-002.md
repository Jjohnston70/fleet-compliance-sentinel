# Deploy a NestJS App (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/nest.md
Original Path: guides/nest.md
Section: guides
Chunk: 2/3

---

### Prepare NestJS app for deployment

In the `src/app.module.ts` file, replace the hardcoded Postgres database credentials with environment variables:

```js

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
```

This allows the app to dynamically pull the correct database configuration from Railway during deployment.

## Deploy the Nest app to Railway

Railway offers multiple ways to deploy your Nest app, depending on your setup and preference.

### One-click deploy from a template

If you’re looking for the fastest way to get started with Nest connected to a Postgres database, the one-click deploy option is ideal.

Click the button below to begin:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/nvnuEH)

It is highly recommended that [you eject from the template after deployment](/templates/deploy#eject-from-template-repository) to create a copy of the repo on your GitHub account.

**Note:** You can also choose from a [variety of Nest app templates](https://railway.com/templates?q=nest) created by the community.

### Deploy from the CLI

1. **Install the Railway CLI**:
   - [Install the CLI](/guides/cli#installing-the-cli) and [authenticate it](/guides/cli#authenticating-with-the-cli) using your Railway account.
2. **Initialize a Railway Project**:
   - Run the command below in your Nest app directory.
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
   - In the `Enter a variable` prompt, enter
     - `DB_DATABASE=${{Postgres.PGDATABASE}}`.
     - `DB_USERNAME=${{Postgres.PGUSER}}`
     - `DB_PASSWORD=${{Postgres.PGPASSWORD}}`
     - `DB_HOST=${{Postgres.PGHOST}}`
     - The Postgres values references the credentials of your new Postgres database. Learn more about [referencing service variables](/variables#referencing-another-services-variable).

   **Note:** Explore the [Railway CLI reference](/cli#add) for a variety of options.

5. **Deploy the Application**:
   - Run `railway up` to deploy your app.
     - This command will scan, compress and upload your app's files to Railway. You’ll see real-time deployment logs in your terminal.
   - Once the deployment is complete, proceed to generate a domain for the app service.
6. **Set Up a Public URL**:
   - Run `railway domain` to generate a public URL for your app.
   - Visit the new URL to see your app live in action!
