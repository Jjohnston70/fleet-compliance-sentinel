# Logs (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/observability/logs.md
Original Path: docs/observability/logs.md
Section: docs
Chunk: 2/3

---

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
