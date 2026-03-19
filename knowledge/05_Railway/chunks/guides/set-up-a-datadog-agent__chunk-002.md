# Set Up a Datadog Agent in Railway (Chunk 2/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/set-up-a-datadog-agent.md
Original Path: guides/set-up-a-datadog-agent.md
Section: guides
Chunk: 2/4

---

## 3. Set up the Node Express app

Now build a Node Express App that will send logs and metrics to the Datadog Agent over the [Private Network](/networking/private-networking).

- Create an `app.js` file inside of the `expressapi` folder you created in Step 1.
- Use `npm` (or your preferred package manager) to install the required dependencies -

  ```npm
  npm i express winston winston-syslog dd-trace
  ```

#### Define the app.js file

The `app.js` file defines your express server. This is where you will import the DataDog tracer and initialize the StatsD client and the Winston logger, which will send traces, metrics, and logs, respectively, to the Datadog agent.

- Within the `app.js` file, add the following contents -

  ```javascript
  // ** it is important to import the tracer before anything else **
  const tracer = require("dd-trace").init();

  const express = require("express");
  const app = express();

  const StatsD = require("hot-shots");
  const { createLogger, format, transports } = require("winston");
  require("winston-syslog").Syslog;
  const port = process.env.PORT || 3000;

  // Configure the StatsD client
  const statsdClient = new StatsD({
    host: process.env.DD_AGENT_HOST,
    port: process.env.DD_AGENT_STATSD_PORT,
    protocol: "udp",
    cacheDns: true,
    udpSocketOptions: {
      type: "udp6",
      reuseAddr: true,
      ipv6Only: true,
    },
  });

  // Configure Winston logger
  const logger = createLogger({
    level: "info",
    exitOnError: false,
    format: format.json(),
    transports: [
      new transports.Syslog({
        host: process.env.DD_AGENT_HOST,
        port: process.env.DD_AGENT_SYSLOG_PORT,
        protocol: "udp6",
        format: format.json(),
        app_name: "node-app",
      }),
    ],
  });

  app.get("/", (req, res) => {
    // Increment a counter for the root path
    statsdClient.increment("data_dog_example.homepage.hits");
    statsdClient.gauge("data_dog_example.homepage.hits", 124);

    // forward logs from root path
    logger.info("Root route was accessed");

    res.send("Hello World!");
  });

  app.get("/test", (req, res) => {
    // Increment a counter for the test path
    statsdClient.increment("data_dog_example.testpage.hits");

    // forward logs from test path
    logger.info("Test route was accessed");

    res.send("This is the test endpoint!");
  });

  app.listen(port, () => {
    console.log(`Example app listening at port ${port}`);
  });
  ```

#### Winston and hot-shots

In this example app, `Winston` is used as the logger and `hot-shots` as the StatsD client.

- `Winston` is configured using `winston-syslog` to transport **logs** to the Datadog agent via Syslog over `udp6`.
- `hot-shots` is configured to send **metrics** to the Datadog agent over `udp6`.

## 4. Set up the Railway project

Now create the project using the CLI, then create the services and variables from within the project in Railway.

You will need your **Datadog API key** and **Site** value in this step.

If you have not already done so, please [install the CLI](/cli#installing-the-cli) and [authenticate](/cli#authenticating-with-the-cli).

#### Create a project

- In your terminal, run the following command to create a new project -

  ```plaintext
  railway init
  ```

- Name your project `datadog-project` when prompted (you can change this later).

- Open your project in Railway by running the following -

  ```plaintext
  railway open
  ```
