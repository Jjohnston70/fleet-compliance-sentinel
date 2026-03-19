# Logs (Chunk 3/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/observability/logs.md
Original Path: docs/observability/logs.md
Section: docs
Chunk: 3/3

---

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
