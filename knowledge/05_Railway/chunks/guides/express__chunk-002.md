# Deploy an Express App (Chunk 2/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/express.md
Original Path: guides/express.md
Section: guides
Chunk: 2/4

---

### Add and configure database

**Note:** This app uses Postgres. If you don’t have it installed locally, you can either [install it](https://www.postgresql.org/download) or use a different Node.js database package of your choice.

1. Create a database named `expresshelloworld_dev`.

2. Install the [pg-promise](https://www.npmjs.com/package/pg-promise) package:

```bash
npm i pg-promise
```

3. Open the `routes/index.js` file and modify the content to the code below:

```js
const express = require("express");
const pgp = require("pg-promise")();
const db = pgp(
  "postgres://username:password@127.0.0.1:5432/expresshelloworld_dev",
);
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  db.one("SELECT NOW()")
    .then(function (data) {
      // Render the page only after receiving the data
      res.render("index", {
        title: "Hello World, Railway!",
        timeFromDB: data.now,
      });
    })
    .catch(function (error) {
      console.error("ERROR:", error);
      // If there’s an error, send a 500 response and do not call res.render
      res.status(500).send("Error querying the database");
    });
});

module.exports = router;
```

The code above sets up a simple Express app with a route handler for the home page. It uses the `pg-promise` library to connect to a Postgres database and runs a query to fetch the current time from the database using `SELECT NOW()`. Upon receiving the data, it renders the index view with the fetched time, sending it to the client along with a title.

If an error occurs during the database query, the code catches the error, logs it, and sends a 500 status response to the client, indicating that there was an issue querying the database.

The page is only rendered after successfully receiving the database response to ensure proper handling of the data.

4. Open the `views/index.pug` file, and update it to display the `timeFromDB` value on the page.

```pug
extends layout

block content
  h1= title
  p Welcome to #{title}
  p This is the time retrieved from the database:
  p #{timeFromDB}
```

5. Run the app again to see your changes in action!

### Prepare Express app for deployment

In the `routes/index.js` file, replace the hardcoded Postgres database URL with an environment variable:

```js
...
const db = pgp(process.env.DATABASE_URL);
...
```

This allows the app to dynamically pull the correct database configuration from Railway during deployment.

## Deploy the Express app to Railway

Railway offers multiple ways to deploy your Express app, depending on your setup and preference.

### One-click deploy from a template

If you’re looking for the fastest way to get started with Express, Pug and connected to a Postgres database, the one-click deploy option is ideal.

Click the button below to begin:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/BC51z6)

For Express API, here's another template you can begin with:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/Y6zLKF)

It is highly recommended that [you eject from the template after deployment](/templates/deploy#eject-from-template-repository) to create a copy of the repo on your GitHub account.

**Note:** You can also choose from a [variety of Express app templates](https://railway.com/templates?q=express) created by the community.
