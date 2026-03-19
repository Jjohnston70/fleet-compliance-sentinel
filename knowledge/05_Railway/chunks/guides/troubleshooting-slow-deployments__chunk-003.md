# Troubleshooting Slow Deployments and Applications (Chunk 3/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/troubleshooting-slow-deployments.md
Original Path: guides/troubleshooting-slow-deployments.md
Section: guides
Chunk: 3/5

---

### Analyze HTTP logs

Railway captures detailed HTTP request logs for every request to your service. These logs are invaluable for identifying slow endpoints and understanding request patterns. For complete documentation on log features and filtering syntax, see the [Logs guide](/observability/logs).

**Key fields for performance troubleshooting:**

| Field | Description |
|-------|-------------|
| `totalDuration` | Total time from request received to response sent (ms) |
| `upstreamRqDuration` | Time your application took to respond (ms) |
| `httpStatus` | Response status code |
| `path` | Request path - identify which endpoints are slow |
| `responseDetails` | Error details if the request failed |
| `txBytes` / `rxBytes` | Response and request sizes |

**Finding slow requests:**

Use the log filter syntax to find requests exceeding a duration threshold:

```
@totalDuration:>1000
```

This finds all requests taking longer than 1 second. You can combine filters to narrow down:

```
@totalDuration:>500 @path:/api/users @method:GET
```

**Understanding the timing fields:**

- **`totalDuration`** includes everything: network time to/from the edge, time in the proxy, and your application's response time
- **`upstreamRqDuration`** is specifically how long your application took to respond

If `totalDuration` is high but `upstreamRqDuration` is low, the latency is in the network path (edge routing, DNS). If `upstreamRqDuration` is high, the slowness is in your application.

**Identifying error patterns:**

Filter by status code to find failing requests:

```
@httpStatus:>=500
```

Check `responseDetails` for specific error information, and `upstreamErrors` for details about connection failures to your application.

### Test locally

If your app is slow on Railway but fast locally, consider:
- Are you hitting external services with higher latency?
- Are you using the correct region for your database?
- Is your application configured to use private networking?

## Common causes of slow applications

### Database queries

Slow database queries are one of the most common causes of application latency.

**Symptoms:**
- API endpoints that worked fast are now slow
- Timeouts on specific operations
- High CPU on your database service

**Solutions:**
- Add database indexes for frequently queried columns
- Use connection pooling
- Review slow query logs
- Consider read replicas for read-heavy workloads

### Wrong region configuration

If your application is in one region but your database is in another, every query incurs geographic latency as traffic travels between regions on Railway's network.

**Symptoms:**
- Consistently high latency on all database operations (typically 50-150ms+ per query depending on distance)

**Solutions:**
- Deploy your application in the same region as your database
