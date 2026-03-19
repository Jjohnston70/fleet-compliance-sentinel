# Deploy a Sails App (Chunk 3/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/sails.md
Original Path: guides/sails.md
Section: guides
Chunk: 3/5

---

5. **Add PostgreSQL & Redis Database Services**:
   - Run `railway add`.
   - Select `PostgreSQL` by pressing space
   - Select `Redis` by also pressing space and hit **Enter** to add both database services to your project.
6. **Modify Sails Database Config**:
   - Open up the `config/env/production.js` file and make some changes to let your app know what database to connect to and where to save sessions:
     - In the `datastores:` section,
       - Add `adapter: 'sails-postgresql'`,
       - Add `url: process.env.DATABASE_URL`
     - In the `session:` section,
       - Add `adapter: '@sailshq/connect-redis'`,
       - Add `url: process.env.REDIS_URL`,
   - Run `npm install sails-postgresql --save` to add the new adapter to your app locally.
7. **Configure Environment Variables on Railway**:
   - Go to your app service [**Variables**](/overview/the-basics#service-variables) section and add the following:
     - `DATABASE_URL`: Set the value to `${{Postgres.DATABASE_URL}}` (this references the URL of your new Postgres database). Learn more about [referencing service variables](/variables#referencing-another-services-variable).
     - `REDIS_URL`: Set the value to `${{Redis.REDIS_URL}}` (this references the URL of your new Redis Database)
   - Use the **Raw Editor** to add any other required environment variables in one go.
8. **Redeploy the Service**:
   - Click **Deploy** on the Railway dashboard to apply your changes.
9. **Upload Local Changes**:
   - Run `railway up` to upload all the changes you made locally and redeploy your service.
10. **Verify the Deployment**:
    - Once the deployment completes, go to **View logs** to check if the server is running successfully.
11. **Set Up a Public URL**:
    - Navigate to the **Networking** section under the [Settings](/overview/the-basics#service-settings) tab of your new service.
    - Click [Generate Domain](/networking/public-networking#railway-provided-domain) to create a public URL for your app.
