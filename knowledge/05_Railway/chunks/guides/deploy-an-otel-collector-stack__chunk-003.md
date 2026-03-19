# Deploy an OpenTelemetry Collector and Backend on Railway (Chunk 3/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/deploy-an-otel-collector-stack.md
Original Path: guides/deploy-an-otel-collector-stack.md
Section: guides
Chunk: 3/5

---

## Checkpoint

Congrats! You should now have a working OpenTelemetry Collector along with a backend stack to which the collector will forward data. Your project in Railway should look something like this -

Be sure to familiarize yourself with the Otel Collector's [configuration file](https://github.com/railwayapp-templates/opentelemetry-collector-stack/blob/main/otel-collector-config.yaml). The documentation on the format and structure of the file can be found [here in Otel's official docs](https://opentelemetry.io/docs/collector/configuration/).

---

## 3. Build and instrument an Express app

Now that the collector stack is up, build and instrument an application!

_Note: The full source code for the [express app](https://github.com/railwayapp-templates/opentelemetry-collector-stack/tree/main/exampleApp) that you will build is available in the Open Telemetry Collector repository that you forked in the previous steps._

### Create and initialize the project

From your local machine -

- Create a folder for your project called `otel-example-app`
- Use `npm` (or your preferred package manager) to install the required dependencies -

  ```npm
  npm i express @opentelemetry/api @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-metrics-otlp-proto @opentelemetry/exporter-trace-otlp-proto @opentelemetry/resources @opentelemetry/sdk-metrics @opentelemetry/sdk-node @opentelemetry/semantic-conventions
  ```

### Build the app

- In the `otel-example-app` folder, create an `app.js` file and add the following code -

  ```javascript
  // app.js //
  const express = require("express");
  const { rollTheDice } = require("./dice.js");

  const PORT = parseInt(process.env.PORT || "8080");
  const app = express();

  app.get("/rolldice", (req, res) => {
    const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
    if (isNaN(rolls)) {
      res
        .status(400)
        .send("Request parameter 'rolls' is missing or not a number.");
      return;
    }
    res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
  });

  app.listen(PORT, () => {
    console.log(`Listening for requests on http://localhost:${PORT}`);
  });
  ```

- Create the `dice.js` file in the project folder and add the following code -

  ```javascript
  // Otel Docs Reference - https://opentelemetry.io/docs/languages/js/instrumentation/
  const { trace } = require("@opentelemetry/api");

  // obtain a trace
  const tracer = trace.getTracer("dice-lib");

  function rollOnce(i, min, max) {
    // start a span
    return tracer.startActiveSpan(`rollOnce:${i}`, span => {
      const result = Math.floor(Math.random() * (max - min) + min);

      // Add an attribute to the span
      span.setAttribute("dicelib.rolled", result.toString());

      // end the span
      span.end();
      return result;
    });
  }

  function rollTheDice(rolls, min, max) {
    // Create a span. A span must be closed.
    return tracer.startActiveSpan("rollTheDice", parentSpan => {
      const result = [];
      for (let i = 0; i < rolls; i++) {
        result.push(rollOnce(i, min, max));
      }
      // Be sure to end the span!
      parentSpan.end();
      return result;
    });
  }

  module.exports = { rollTheDice };
  ```

  Refer to the OpenTelemetry documentation to gain a richer understanding of this code. The code you see above can be found [here](https://opentelemetry.io/docs/languages/js/instrumentation/).
