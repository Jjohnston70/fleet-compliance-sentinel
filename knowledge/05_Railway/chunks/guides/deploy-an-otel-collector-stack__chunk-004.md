# Deploy an OpenTelemetry Collector and Backend on Railway (Chunk 4/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/deploy-an-otel-collector-stack.md
Original Path: guides/deploy-an-otel-collector-stack.md
Section: guides
Chunk: 4/5

---

### Build the instrumentation sdk

- In the `otel-example-app` folder, create an `instrumentation.js` file and add the following code -

  ```javascript
  // Otel Docs Reference - https://opentelemetry.io/docs/languages/js/instrumentation
  const { NodeSDK } = require("@opentelemetry/sdk-node");
  const {
    getNodeAutoInstrumentations,
  } = require("@opentelemetry/auto-instrumentations-node");
  const {
    OTLPTraceExporter,
  } = require("@opentelemetry/exporter-trace-otlp-proto");
  const { Resource } = require("@opentelemetry/resources");
  const {
    SEMRESATTRS_SERVICE_NAME,
    SEMRESATTRS_SERVICE_VERSION,
  } = require("@opentelemetry/semantic-conventions");
  const {
    OTLPMetricExporter,
  } = require("@opentelemetry/exporter-metrics-otlp-proto");
  const {
    PeriodicExportingMetricReader,
  } = require("@opentelemetry/sdk-metrics");

  const sdk = new NodeSDK({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: "dice-server",
      [SEMRESATTRS_SERVICE_VERSION]: "0.1.0",
    }),
    traceExporter: new OTLPTraceExporter({
      url: `http://${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `http://${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
      }),
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();
  ```

  This code will wrap your application code and capture the telemetry data. In the steps that follow, you will see how to start your application in Railway with a custom start command that utilizes this SDK.

  Refer to the OpenTelemetry documentation to gain a richer understanding of this code. The code you see above can be found [here](https://opentelemetry.io/docs/languages/js/instrumentation/).

## 4. Deploy the Express app

### Create an empty service and configure the environment

In the same Railway project -

- Add a New service by clicking `+ New`
- Select `Empty Service`
- Add the following variable to the service
  ```plaintext
  OTEL_EXPORTER_OTLP_ENDPOINT=${{OpenTelemetry Collector.RAILWAY_PRIVATE_DOMAIN}}:4318
  ```
  _This is used by the Express app to connect to the OpenTelemetry Collector_
- In the service Settings, add the following [Custom Start Command](/deployments/start-command):
  ```plaintext
  node --require ./instrumentation.js app.js
  ```
  _This wraps the Express app on startup with the instrumentation SDK you created above._
- In the service Settings, rename the service to `Express App`
- Click `Deploy` to apply and create the empty service
- In the Settings tab, under Networking, click `Generate Domain`

### Deploy from the Railway CLI

_This step assumes you have the latest version of the [Railway CLI](/cli#installing-the-cli) installed._

On your local machine -

- Open your terminal and change directory to the `otel-example-app` folder
- Link to the Railway project and service by running the following command -

  ```plaintext
  railway link
  ```

  Follow the prompts selecting the correct project name and environment (click [here](https://res.cloudinary.com/railway/image/upload/v1709917423/docs/tutorials/otel/CleanShot_2024-03-08_at_10.58.55_2x_kacssj.png) for a reference), and choose the `Express App` service.

- Deploy the Express App by running the following command -
  ```plaintext
  railway up -d
  ```
