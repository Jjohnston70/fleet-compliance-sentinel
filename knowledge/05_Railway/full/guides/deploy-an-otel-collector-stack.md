Title: Deploy an OpenTelemetry Collector and Backend on Railway
Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/deploy-an-otel-collector-stack.md
Original Path: guides/deploy-an-otel-collector-stack.md
Section: guides

---

# Deploy an OpenTelemetry Collector and Backend on Railway

Monitor and trace your applications by deploying an OpenTelemetry Collector and backend on Railway.

## What is OpenTelemetry?

> OpenTelemetry is an Observability framework and toolkit designed to create and manage telemetry data such as traces, metrics, and logs. Crucially, OpenTelemetry is vendor- and tool-agnostic, meaning that it can be used with a broad variety of Observability backends, including open source tools like Jaeger and Prometheus, as well as commercial offerings.

## About this tutorial

There is an overwhelming number of options for applying OpenTelemetry in your software stack. This tutorial uses the libraries and tools endorsed and/or maintained by the OpenTelemetry community.

OpenTelemetry is commonly referred to simply as "Otel". You will see both terms used throughout this tutorial.

**Objectives**

In this tutorial you will learn how to -

- Deploy the [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/), listening for traces, metrics, and logs.
- Deploy a backend stack ([Jaeger](https://www.jaegertracing.io/), [Zipkin](https://zipkin.io/), and [Prometheus](https://prometheus.io/)) to receive the traces, metrics, and logs from the collector
- Build and instrument an [Express](https://expressjs.com/) application to send data to the collector.

**Prerequisites**

To be successful using this tutorial, you should already have -

- Latest version of Railway [CLI installed](/cli#installing-the-cli)
- A GitHub account

**OpenTelemetry Collector Template and Demo**

If you are looking for a quicker way to get started, you can deploy the collector and backend stack from a template by clicking the button below.
[](https://railway.com/template/7KNDff)

There is also a live demo of the project you will build in this tutorial [here](https://classy-writing-production.up.railway.app/), and you can access the code repository [here in Github](https://github.com/railwayapp-templates/opentelemetry-collector-stack). You can find some example apps, including the one you will build in this tutorial, in the [exampleApps folder](https://github.com/railwayapp-templates/opentelemetry-collector-stack/tree/main/exampleApps).

**Let's get started!**

## 1. Deploy the backend services

First, deploy the backend services:

- [Jaeger](https://www.jaegertracing.io/) - an open-source, distributed tracing system that will receive telemetry data from the collector
- [Zipkin](https://zipkin.io/) - also an open-source, distributed tracing system that will receive telemetry data from the collector
- [Prometheus](https://prometheus.io/) - an open-souce, systems monitoring and alerting toolkit that will receive telemetry data from the collector

_Jaeger and Zipkin offer similar functionality, and it is not necessary to run both. The intent is to give you different examples of backend services._

Each of the following steps should be completed in the same Railway project.

### Add Jaeger service

- Add a New service by clicking `+ New`
- Select Docker Image as the Source
- Add `jaegertracing/all-in-one` as the image name and hit Enter
- Add the following variable to the service
  ```plaintext
  PORT=16686
  ```
  _This is the port that serves the UI. Setting this variable allows you to access the Jaeger UI from your browser_
- In the Settings tab, rename the service `Jaeger`
- Click `Deploy` to apply and deploy the service
- In the Settings tab, under Networking, click `Generate Domain`

You should be able to access the Jaeger UI by clicking on the service domain.

### Add zipkin service

- Add a New service by clicking `+ New`
- Select Docker Image as the Source
- Add `openzipkin/zipkin` as the image name and hit Enter
- Add the following variable to the service
  ```plaintext
  PORT=9411
  ```
  _This is the port that serves the UI. Setting this variable allows you to access the Zipkin UI from your browser_
- In the Settings tab, rename the service `Zipkin`
- Click `Deploy` to apply and deploy the service
- In the Settings tab, under Networking, click `Generate Domain`

You should be able to access the Zipkin UI by clicking on the service domain.

### Add Prometheus service

- Add a New service by clicking `+ New`
- Select Template as the Source
- Type Prometheus and select the Prometheus template (be sure to select [this one](https://railway.com/template/KmJatA))
- Click `Deploy` to apply and deploy the service

_The template deploys with the proper UI port already configured to enable accessing the Prometheus UI from your browser_

You should be able to access the Prometheus UI by clicking on the service domain.

## 2. Deploy the OpenTelemetry collector

The OpenTelemetry Collector is a vendor-agnostic service that receives, processes, and exports telemetry data.

It is not strictly necessary to run a collector when implementing OpenTelemetry, but it is recommended by the OpenTelemetry community. More information on the subject can be found [here](https://opentelemetry.io/docs/collector/#when-to-use-a-collector).

### Fork the open telemetry collector repository

- Navigate to the [Open Telemetry Collector repository](https://github.com/railwayapp-templates/opentelemetry-collector-stack) in GitHub
- Click `Fork` then `Create fork`

### Add the open telemetry service

In the Railway project -

- Add a New service by clicking `+ New`
- Select GitHub Repo as the Source
- Select the `opentelemetry-collector-stack` repository (if you renamed the repo in the previous step, yours will be named differently)
- Add the following variable to the service
  ```plaintext
  PORT=55679
  ```
  _This is the port that serves the collector's debugging UI. Setting this variable allows you to access the UI from your browser_
- In the Settings tab, rename the service `OpenTelemetry Collector`
- Click `Deploy` to apply and deploy the service
- In the Settings tab, under Networking, click `Generate Domain`

The Collector's debugging UI is enabled by default and accessible from the browser. This is controlled by the inclusion of the [zpages extension in the collector's configuration yaml](https://github.com/railwayapp-templates/opentelemetry-collector-stack/blob/main/otel-collector-config.yaml#L31). You can read more about the UI and the available routes, in the collector's [source repo](https://github.com/open-telemetry/opentelemetry-collector/blob/main/extension/zpagesextension/README.md).

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

## 5. Test and confirm

Test that everything is working by generating some traffic to your Express App. There is a single route, `/rolldice`, that takes a `rolls` query string -

- `/rolldice?rolls=10`

Generate some traffic to this route, updating the number of rolls to different numbers, and verify that you see traces and spans in Jaeger and Zipkin.


        Jaeger


        Zipkin


## Bonus - nextjs

This tutorial was born out of an exploration into instrumenting some of Railway's applications with [NextJS's Otel library](https://nextjs.org/docs/pages/building-your-application/optimizing/open-telemetry#custom-exporters). This means that you can use this Otel collector stack to capture telemetry data from your NextJS app!

### Send telemetry data from nextjs

Assuming you've followed the docs mentioned above to instrument your NextJS app, you can configure it to send requests to your collector in Railway by setting the required environment variable in the NextJS application.

_If your Next App is deployed in the **same Railway project as the collector**, you can use the private network -_

```plaintext
OTEL_EXPORTER_OTLP_ENDPOINT=http://${{otel-collector.RAILWAY_PRIVATE_DOMAIN}}:4318
```

_If your Next App is deployed in **another Railway project, or outside of Railway entirely**, you can use the public network -_

```plaintext
OTEL_EXPORTER_OTLP_ENDPOINT=https://
```

- Note: If you use the public domain, you will need to update the PORT environment variable in your Otel Collector service to `PORT=4318`

#### Debugging in nextjs

Another helpful environment variable, specific to Node, is the debug directive -

```plaintext
OTEL_LOG_LEVEL=debug
```

## Helpful resources

The OpenTelemetry Documentation is complete and easy to follow. Spend time getting familiar with the docs. Here are some sections that are especially helpful -

- [OpenTelemetry Components](https://opentelemetry.io/docs/concepts/components/)
- [OTLP Spec](https://opentelemetry.io/docs/specs/otlp/)
- [Collector Docs](https://opentelemetry.io/docs/collector/)
- [Collector Configuration Tool OTelBin](https://www.otelbin.io)
- [Supported Languages](https://opentelemetry.io/docs/languages/)
- [Vendors with Native OTLP Support](https://opentelemetry.io/ecosystem/vendors/) (explore this list for different backend options)

## Conclusion

Congratulations! You have deployed an OpenTelemetry Collector and a Node Express app that sends data to the collector which then sends it to Jaeger, Prometheus, and Zipkin.

This is a _very_ basic implementation, and you should refer to the [OpenTelemetry documentation](https://opentelemetry.io/docs/) for information on how to customize your implementation.
