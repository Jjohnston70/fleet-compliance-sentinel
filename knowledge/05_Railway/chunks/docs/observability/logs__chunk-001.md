# Logs (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/observability/logs.md
Original Path: docs/observability/logs.md
Section: docs
Chunk: 1/3

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
