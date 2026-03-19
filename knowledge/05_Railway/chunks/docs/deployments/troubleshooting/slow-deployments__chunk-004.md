# Troubleshooting Slow Deployments and Applications (Chunk 4/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/deployments/troubleshooting/slow-deployments.md
Original Path: docs/deployments/troubleshooting/slow-deployments.md
Section: docs
Chunk: 4/5

---

### Not using private networking

If services within the same project communicate over the public internet instead of [private networking](/private-networking), you add unnecessary latency and incur [egress costs](/pricing/plans#resource-usage-pricing). Private networking is for **server-to-server communication only**. It won't work for requests originating from a user's browser.

**Symptoms:**
- Using public URLs (e.g., `your-app.up.railway.app`) for inter-service communication
- Connection strings using public hostnames
- Unexpectedly high network egress charges on your bill

**Solutions:**
- Use `*.railway.internal` hostnames for service-to-service communication
- Update connection strings to use private networking addresses and ports
- For frontend applications that need to call backend APIs, use private networking from your server-side code (API routes, SSR) while keeping public URLs for client-side browser requests

**Example:**
```javascript
// Server-side code (API routes, SSR): use private networking
const apiUrl = "http://api.railway.internal:3000";

// Client-side code (browser): must use public URL
const apiUrl = "https://api.up.railway.app";
```

### Resource constraints

Your application may be hitting resource limits, causing throttling or OOM (out of memory) kills.

**Symptoms:**
- Application crashes with exit code 137 (OOM killed)
- Consistently high CPU usage at 100%
- Slow response times during high load

**Solutions:**
- Check your [metrics](/observability/metrics) to see actual resource usage
- Adjust [resource limits](/deployments/optimize-performance) if you're consistently hitting them
- Optimize your application's memory and CPU usage
- Consider [horizontal scaling](/deployments/scaling#horizontal-scaling-with-replicas) for stateless workloads

### Large container images

Large images take longer to pull, especially on first deployment to a new compute node.

**Symptoms:**
- "Creating containers" phase takes several minutes
- Large build output size shown in build logs

**Solutions:**
- Use multi-stage Docker builds to reduce final image size
- Use smaller base images (e.g., Alpine variants)
- Exclude unnecessary files with `.dockerignore`
- Remove development dependencies from production builds

### Slow application startup

If your application takes time to initialize, it affects the healthcheck phase duration.

**Symptoms:**
- Healthcheck takes a long time to pass
- Application logs show initialization steps running

**Solutions:**
- Defer non-critical initialization to after the app is ready to serve traffic
- Use lazy loading for heavy dependencies
- Increase healthcheck timeout if startup time is legitimate
- Consider a dedicated healthcheck endpoint that responds before full initialization

## What plan upgrades actually do

Upgrading your plan increases your **resource limits**, not guaranteed performance. Understanding this distinction is important.

### What upgrading provides

| Plan | Per-Replica vCPU Limit | Per-Replica Memory Limit |
|------|------------------------|--------------------------|
| **Hobby** | 8 vCPU | 8 GB |
| **Pro** | 24 vCPU | 24 GB |
| **Enterprise** | Custom | Custom |

Upgrading raises the ceiling on how many resources a single replica can use. Your application only uses what it needs, up to the limit.
