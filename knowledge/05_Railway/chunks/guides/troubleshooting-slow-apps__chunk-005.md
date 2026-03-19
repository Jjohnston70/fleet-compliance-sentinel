# Troubleshooting Slow Deployments and Applications (Chunk 5/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/troubleshooting-slow-apps.md
Original Path: guides/troubleshooting-slow-apps.md
Section: guides
Chunk: 5/5

---

### When upgrading helps

Upgrading helps when:
- Your metrics show you're hitting current resource limits
- Your application needs more memory (e.g., processing large datasets)
- You need more CPU for compute-intensive tasks
- You want to run more replicas (higher replica limits on higher plans)

### When upgrading doesn't help

Upgrading won't help when:
- Slowness is caused by external services (databases, APIs)
- Your application has inefficient code
- Network latency is the bottleneck
- You're not actually using your current resource allocation

**Always check your metrics before upgrading.** If your service uses 500MB of memory and 0.5 vCPU, upgrading from Hobby to Pro won't make it faster.

## Edge routing and latency

Railway operates edge proxies in multiple regions. For a complete overview of edge infrastructure, see the [Edge Networking reference](/networking/edge-networking). Understanding how traffic is routed helps diagnose latency issues.

### How edge routing works

When a request comes in:
1. It hits the nearest Railway edge proxy
2. The edge proxy routes it to your service in the configured region
3. Your service processes the request and responds

You can see which edge handled a request via the `X-Railway-Edge` response header.

### Checking the edge header

```bash
curl -I https://your-app.up.railway.app | grep -i X-Railway-Edge
```

The header value shows the region, e.g., `railway/us-west2`.

### Why traffic might hit the wrong edge

- DNS caching: Your local DNS resolver may have cached an old record
- CDN/Proxy interference: Services like Cloudflare route based on their own logic
- Geographic routing: Users in certain regions may be routed suboptimally

### Optimizing for global users

If you have users worldwide, you can use [multi-region replicas](/deployments/scaling#multi-region-replicas) to deploy stateless services closer to your users. Railway automatically routes traffic to the nearest region.

**Note:** Multi-region works well for stateless application servers, but databases typically run in a single region. If your app is deployed globally but your database is in one region, replicas far from the database will still experience latency on database queries. To mitigate this:
- Use application-level caching to reduce database round-trips
- Consider database read replicas in additional regions for read-heavy workloads
- Accept the latency trade-off for writes, which must go to the primary database

### Private networking and edge

Private networking (`*.railway.internal`) bypasses the edge entirely. Services communicate directly within Railway's infrastructure, which is faster than going through the public internet.

## When to contact support

Contact Railway support through [Central Station](https://station.railway.com) if:

- Deployments are consistently slow with no apparent cause
- You see **544 Railway Proxy Error** responses, which indicate a platform-side issue (as opposed to 502 errors, which indicate application issues)
- The status page shows no issues but you're experiencing degraded performance
- You need help optimizing your deployment configuration

**Tip:** When reporting issues, include the `X-Railway-Request-Id` header from affected requests. This unique identifier helps Railway support trace your request through the infrastructure. You can find it in your HTTP response headers.
