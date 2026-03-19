# Deploy an OpenTelemetry Collector and Backend on Railway (Chunk 2/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/deploy-an-otel-collector-stack.md
Original Path: guides/deploy-an-otel-collector-stack.md
Section: guides
Chunk: 2/5

---

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
