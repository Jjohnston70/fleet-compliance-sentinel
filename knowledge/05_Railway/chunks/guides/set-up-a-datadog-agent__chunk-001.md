# Set Up a Datadog Agent in Railway (Chunk 1/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/set-up-a-datadog-agent.md
Original Path: guides/set-up-a-datadog-agent.md
Section: guides
Chunk: 1/4

---

# Set Up a Datadog Agent in Railway

Learn how to set up a Datadog agent in Railway.

Datadog provides a centralized location for logs, metrics, and traces emitted from applications deployed in various locations.

While Railway has a native, [centralized logging mechanism](/observability/logs#log-explorer), you may have a need to ship this data to another location, to view it alongside data collected from systems outside of Railway.

**Objectives**

In this tutorial you will learn how to -

- Deploy a Datadog agent in Railway - listening for metrics, logs, and traces.
- Configure an application to send metrics, logs, and traces to the agent.

If you are looking for a quicker way to get started, you can also deploy this project from a [template](https://railway.com/template/saGmYG).

**Prerequisites**

To be successful, you should already have -

- Railway [CLI installed](/cli#installing-the-cli)
- Datadog API key and site value

**Caveats**

Keep in mind that the Datadog agent sends data to Datadog over the Internet, meaning you will see an increase in egress cost. If this is a concern, you may be interested in exploring self-hosted solutions, check out the [OpenTelemetry Tutorial](/guides/deploy-an-otel-collector-stack).

## 1. Create the project structure

First, create the project structure.

From your local machine -

- Create a folder for your project called `railway-project`.
- Create two folders inside of `railway-project` called `agent` and `expressapi`.

You project structure should look like this

```
railway-project/
├── agent/
└── expressapi/
```

## 2. Set up the Datadog agent

Now add files to the `agent` folder, which will build the Datadog Agent image.

- Inside of the `agent` folder, create three files -
  - `Dockerfile`
  - `syslog.yaml`
  - `datadog.yaml`

#### Define the Dockerfile

Define the Dockerfile.

- Within your Dockerfile, add the following contents.

  ```dockerfile
  FROM datadog/agent:7

  # Set environment variables
  ENV DD_LOGS_ENABLED=true
  ENV DD_APM_ENABLED=true
  ENV DD_LOGS_CONFIG_CONTAINER_COLLECT_ALL=true
  ENV DD_DOGSTATSD_NON_LOCAL_TRAFFIC=true
  ENV DD_APM_NON_LOCAL_TRAFFIC=true
  ENV DD_BIND_HOST=::1

  # Reference Variables defined in Railway
  ARG DD_API_KEY
  ARG DD_HOSTNAME
  ARG DD_SITE

  # Copy datadog.yaml into the container
  COPY datadog.yaml /etc/datadog-agent/datadog.yaml

  # Copy syslog configuration file
  COPY syslog.yaml /etc/datadog-agent/conf.d/syslog.d/

  # DogStatsD port, APM port, and the syslog port
  EXPOSE 8125/udp
  EXPOSE 8126
  EXPOSE 514/udp
  ```

#### Define the syslog.yaml file

The `syslog.yaml` file is used to instruct the agent to listen for syslogs to be forwarded on the configured port.

- Within the `syslog.yaml` file, add the following contents -

  ```
  logs:
    - type: udp
      port: 514
      service: "node-app"
      source: syslog
  ```

#### Define the datadog.yaml file

The `datadog.yaml` file is used to instruct the agent to send logs to Datadog over `http` instead of the default `tcp`.

- Within the `datadog.yaml` file, add the following contents -

  ```
  logs_config:
    force_use_http: true
  ```
