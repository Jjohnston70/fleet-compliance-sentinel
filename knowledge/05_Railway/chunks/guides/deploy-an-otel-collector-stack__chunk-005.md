# Deploy an OpenTelemetry Collector and Backend on Railway (Chunk 5/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/deploy-an-otel-collector-stack.md
Original Path: guides/deploy-an-otel-collector-stack.md
Section: guides
Chunk: 5/5

---

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
