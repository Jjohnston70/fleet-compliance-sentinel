# Deploy an OpenTelemetry Collector and Backend on Railway (Chunk 1/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/deploy-an-otel-collector-stack.md
Original Path: guides/deploy-an-otel-collector-stack.md
Section: guides
Chunk: 1/5

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
