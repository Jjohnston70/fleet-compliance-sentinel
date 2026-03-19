# Troubleshooting Slow Deployments and Applications (Chunk 2/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/troubleshooting-slow-deployments.md
Original Path: guides/troubleshooting-slow-deployments.md
Section: guides
Chunk: 2/5

---

## Is it Railway or my app?

Before diving into optimization, determine whether the slowness is on Railway's side or within your application. In the vast majority of cases, performance issues originate from the application itself - inefficient queries, resource constraints, or configuration problems - rather than the platform.

### Check Railway status

Visit [status.railway.com](https://status.railway.com) to see if there are any ongoing incidents or degraded performance affecting the platform. If there's a platform-wide issue, it will be reported here. If status shows all systems operational, the issue is almost certainly within your application or its dependencies.

### Check build logs

Build logs show output from the build phase (installing dependencies, compiling code, creating the container image). The deployment view shows each phase with timing information.

Look for:
- Dependency installation steps that take disproportionately long
- Cache misses causing full rebuilds
- Large assets being processed

### Check deployment logs

Deployment logs show your application's stdout/stderr while it's running. These help diagnose runtime issues that occur after your app starts.

Look for:
- Database connection errors or timeouts
- Slow query warnings
- Application exceptions or errors
- Healthcheck failures

### Check your application metrics

Railway provides [metrics](/observability/metrics) for CPU, memory, and network usage. High resource usage can indicate:
- Your application is resource-constrained
- Inefficient code paths
- Memory leaks causing garbage collection pressure

For deeper insights, consider integrating an Application Performance Monitoring (APM) tool like Datadog, New Relic, or open-source alternatives like OpenTelemetry. APM tools provide distributed tracing, helping you identify slow database queries, external API calls, and bottlenecks that Railway's built-in metrics don't capture.
