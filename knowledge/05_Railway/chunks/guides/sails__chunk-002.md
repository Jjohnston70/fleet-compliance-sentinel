# Deploy a Sails App (Chunk 2/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/sails.md
Original Path: guides/sails.md
Section: guides
Chunk: 2/5

---

## Deploy from the CLI

To deploy the Sails app using the Railway CLI, please follow the steps:

1. **Install the Railway CLI**:
   - [Install the CLI](/guides/cli#installing-the-cli) and [authenticate it](/guides/cli#authenticating-with-the-cli) using your Railway account.
2. **Initialize a Railway Project**:
   - Run the command below in your Sails app directory.
     ```bash
     railway init
     ```
   - Follow the prompts to name your project.
   - After the project is created, click the provided link to view it in your browser.
3. **Modify Sails Config**:
   - Open up `config/env/production.js` file and make some changes:
     - Set `http.trustProxy` to `true` because your app will be behind a proxy.
     - Set `session.cookie.secure` to `true`
     - Add this function to the `socket` object just after the `onlyAllowOrigins` array:
       ```js
       beforeConnect: function(handshake, proceed) {
         // Send back `true` to allow the socket to connect.
         // (Or send back `false` to reject the attempt.)
         return proceed(undefined, false);
       },
       ```
       **Note:** This is only added because sockets aren't needed now. If you do need sockets, skip this step and add your public app URL to the `onlyAllowOrigins` array. The function simply rejects socket connection attempts.
4. **Deploy the Application**:
   - Use the command below to deploy your app:
     ```bash
     railway up
     ```
   - This command will scan, compress and upload your app's files to Railway. You’ll see real-time deployment logs in your terminal.

- **Note:** You'll come across an error about how the default `sails-disk` adapter and `connect.session()` MemoryStore is not designed for use as a production database, don’t worry. You’ll fix this in the next step.
