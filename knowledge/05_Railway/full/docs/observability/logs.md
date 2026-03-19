Title: Logs
Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/observability/logs.md
Original Path: docs/observability/logs.md
Section: docs

---

# Logs

Learn how to view, filter, and search build, deployment, environment, and HTTP logs on Railway.

Any build or deployment logs emitted to standard output or standard error (e.g. `console.log(...)`) are captured by Railway to be viewed or searched later.

There are three ways to view logs in Railway.

- **Build/Deploy Panel** → Click on a deployment in the dashboard
- **Log Explorer** → Click on the Observability tab in the top navigation
- **CLI** → Run the `railway logs` command

## Build / deploy panel

Logs for a specific deployment can be viewed by clicking on the deployment in the service window, useful when debugging application failures.

Similarly, logs for a specific build can be viewed by clicking on the **Build Logs** tab once you have a deployment open.

## Log explorer

Logs for the entire environment can be viewed together by clicking the "Observability" button in the top navigation. The Log Explorer is useful for debugging more general problems that may span multiple services.

The log explorer also has additional features like selecting a date range or toggling the visibility of specific columns.

## Command line

Deployment logs can also be viewed from the command line to quickly check the current status of the latest deployment. Use `railway logs` to view them.

## Filtering logs

Railway supports a custom filter syntax that can be used to query logs.

Filter syntax is available for all log types, but some log types have specific attributes.

### Filter syntax

- `` or `"key phrase"` → Filter for a partial substring match
- `@attribute:value` → Filter by custom attribute (see structured logs below)
- `@arrayAttribute[i]:value` → Filter by an array element
- `replica:` → Filter by a specific replica's UUID

You can combine expressions with boolean operators `AND`, `OR`, and `-` (negation). Parentheses can be used for grouping.

#### Numeric comparisons

Numeric filtering uses comparison operators and ranges, and works for deployment logs with JSON logging. It's also supported for these HTTP log attributes:

- `@totalDuration` → Total request duration in milliseconds
- `@responseTime` → Time to first byte in milliseconds
- `@upstreamRqDuration` → Upstream request duration in milliseconds
- `@httpStatus` → HTTP status code
- `@txBytes` → Bytes transmitted (response size)
- `@rxBytes` → Bytes received (request size)

**Supported operators:**

- `>` → Greater than
- `>=` → Greater than or equal to
- `<` → Less than
- `<=` → Less than or equal to
- `..` → Range (inclusive)

### Log type attributes

#### Environment logs

Environment logs allow you to query for logs from the environment they were emitted in. This means that you can search for logs emitted by all services in an environment at the same time, all in one central location.

In addition to the filters available for deployment logs, an additional filter is available for environment logs:

- `@service:` → Filter by a specific service's UUID

#### HTTP logs

HTTP logs use the same filter syntax, but have a specific set of attributes for HTTP-specific data.

- `@requestId:` → Filter by request ID
- `@timestamp:` → Filter by timestamp (Formatted in RFC3339)
- `@method:` → Filter by method
- `@path:` → Filter by path
- `@host:` → Filter by host
- `@httpStatus:` → Filter by HTTP status code
- `@responseDetails:` → Filter by response details (Only populated when the application fails to respond)
- `@clientUa:` → Filter by a specific client's user agent
- `@srcIp:` → Filter by source IP (The client's IP address that made the request)
- `@edgeRegion:` → Filter by edge region (The region of the edge node that handled the request)

### Examples

#### Deployment logs

Find logs that contain the word `request`.

```text
request
```

Find logs that contain the substring `POST /api`.

```text
"POST /api"
```

Find logs with an error level.

```text
@level:error
```

Find logs with a warning level.

```text
@level:warn
```

Find logs with an error level that contain specific text.

```text
@level:error AND "failed to send batch"
```

Find logs with a specific custom attribute.

```text
@customAttribute:value
```

Find logs with a specific array attribute.

```text
@arrayAttribute[i]:value
```

Find tasks that take 10 minutes or more.

```text
@task_duration:>=600
```

Find batches with more than 100 items.

```text
@batch_size:>100
```

Find retries between 1 and 3.

```text
@retries:1..3
```

#### Environment logs

Filter out logs from the Postgres database service.

```text
-@service:
```

Filter logs from the Postgres database service and the Redis cache service.

```text
-@service: AND -@service:
```

Show only logs from the Postgres database and Redis cache services.

```text
@service: OR @service:
```

#### HTTP logs

Find logs for a specific path.

```text
@path:/api/v1/users
```

Find logs for a specific path that returned a 500 error.

```text
@path:/api/v1/users AND @httpStatus:500
```

Find logs for a specific path that returned a 500 or 501 error.

```text
@path:/api/v1/users AND (@httpStatus:500 OR @httpStatus:501)
```

Find all non-200 responses.

```text
-@httpStatus:200
```

Find all requests that originated from or around Europe.

```text
@edgeRegion:europe-west4-drams3a
```

Find all requests that originated from a specific IP address.

```text
@srcIp:66.33.22.11
```

Find slow responses taking more than 500ms.

```text
@responseTime:>500
```

Find responses taking 1 second or more.

```text
@responseTime:>=1000
```

Find fast responses under 100ms.

```text
@responseTime:<100
```

Find responses between 100-500ms.

```text
@responseTime:100..500
```

Find all error responses (4xx and 5xx).

```text
@httpStatus:>=400
```

Find only server errors (5xx).

```text
@httpStatus:500..599
```

Find all successful responses (1xx, 2xx, 3xx).

```text
@httpStatus:<400
```

Find large responses over 1MB.

```text
@txBytes:>1000000
```

Find requests with body larger than 5KB.

```text
@rxBytes:>5000
```

Combine filters to find slow requests that errored.

```text
@totalDuration:>5000 @httpStatus:>=500
```

Find slow, large responses.

```text
@responseTime:>1000 @txBytes:>100000
```

## View in context

When searching for logs, it is often useful to see surrounding logs. To view a log in context:
right-click any log, then select the "View in Context" option from the dropdown menu.

## Structured logs

Structured logs are logs emitted in a structured JSON format, useful if you want
to attach custom metadata to logs or preserve multi-line logs like stack traces.

```typescript
console.log(
  JSON.stringify({
    message: "A minimal structured log", // (required) The content of the log
    level: "info", // Severity of the log (debug, info, warn, error)
    customAttribute: "value", // Custom attributes (query via @name:value)
  }),
);
```

Structured logs are best generated with a library for your language. For example, the default [Winston](https://github.com/winstonjs/winston) JSON format emits logs in the correct structure by default.

Logs with a `level` field will be coloured accordingly in the log explorer.

Logs emitted to `stderr` will be converted to `level.error` and coloured red.

### Examples

Here are a few examples of structured logs.

**Note:** The entire JSON log must be emitted on a single line to be parsed correctly.

```json
{ "level": "info", "message": "A minimal structured log" }
```

```json
{ "level": "error", "message": "Something bad happened" }
```

```json
{ "level": "info", "message": "New purchase!", "productId": 123, "userId": 456 }
```

```json
{
  "level": "info",
  "message": "User roles updated",
  "roles": ["editor", "viewer"],
  "userId": 123
}
```

### Normalization strategy

In order to ensure a consistent query format across Railway services, incoming logs are normalized to the above format automatically.

- Non-structured logs are converted to `{"message":"...","level":"..."}`

- `log.msg` converted to `log.message`

- `log.level` converted to `log.severity`

- Logs from `stderr` are converted to `level.error`

- Logs from `stdout` are converted to `level.info`

- Levels are lowercased and matched to the closest of `debug`, `info`, `warn`, `error`

## Log retention

Depending on your plan, logs are retained for a certain amount of time.

| Plan          | Retention\*   |
| ------------- | ------------- |
| Hobby / Trial | 7 days        |
| Pro           | 30 days       |
| Enterprise    | Up to 90 days |

_\* Upgrading plans will immediately restore logs that were previously outside of the retention period._

## Logging throughput

To maintain quality of service for all users, Railway enforces a logging rate limit of **500 log lines per second per [replica](/deployments/scaling#horizontal-scaling-with-replicas)** across all plans. When this limit is exceeded, additional logs are dropped and you'll see a warning message like this:

```txt
Railway rate limit of 500 logs/sec reached for replica, update your application to reduce the logging rate. Messages dropped: 50
```

If you encounter this limit, here are some strategies to reduce your logging volume:

- Reduce log verbosity in production
- Use structured logging with minimal formatting (e.g., minified JSON instead of pretty-printed objects)
- Implement log sampling for high-frequency events
- Conditionally disable verbose logging based on the environment
- Combine multiple related log entries into single messages

## Troubleshooting

Having issues with logs? Check out the [Troubleshooting guide](/troubleshooting) or reach out on the [Railway Discord](https://discord.gg/railway).
