# Troubleshooting Slow Deployments and Applications (Chunk 1/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/troubleshooting-slow-deployments.md
Original Path: guides/troubleshooting-slow-deployments.md
Section: guides
Chunk: 1/5

---

# Troubleshooting Slow Deployments and Applications

Learn how to diagnose and fix slow deployments and application performance issues on Railway.

When your deployment takes longer than expected or your application feels slow, it helps to understand what's happening behind the scenes. This guide walks you through Railway's deployment process, how to identify where slowdowns occur, and what you can do about them.

## Understanding deployment phases

Every deployment on Railway goes through several distinct phases. Understanding these phases helps you identify where delays are occurring.

### Phase overview

| Phase | What Happens | Typical Duration |
|-------|--------------|------------------|
| **Initialization** | Railway takes a snapshot of your code | Seconds |
| **Build** | Your code is built into a container image | 1-10+ minutes |
| **Pre-Deploy** | Dependencies are checked and volumes are migrated if needed | Seconds to minutes |
| **Deploy** | Container is created and started | 30 seconds to 2 minutes |
| **Network** | Healthchecks run (if configured) | Up to 5 minutes (configurable) |
| **Post-Deploy** | Previous deployment is drained and removed | Seconds |

### Detailed phase breakdown

#### Initialization (snapshot Code)

Railway captures a snapshot of your source code. This is typically fast unless you have an unusually large repository or many files.

#### Build phase

The build phase is often the longest part of a deployment. Railway uses [Railpack](/builds/railpack) (or a [Dockerfile](/builds/dockerfiles) if present) to build your application into a container image.

Common causes of slow builds:
- Large dependency trees (many npm packages, Python dependencies, etc.)
- No build caching (first build or cache invalidation)
- Compiling native extensions
- Large assets being processed

**Tip:** Check the build logs to see which steps are taking the longest.

#### Pre-deploy

This phase handles:
- **Waiting for dependencies**: If your service depends on another service that's also deploying, Railway waits for it to be ready
- **Volume migration**: If you changed your service's region and it has a volume attached, the volume data must be migrated. This can take significant time depending on volume size

#### Deploy (creating containers)

This phase involves:
1. **Pulling the container image** to the compute node
2. **Creating the container** with your configuration
3. **Mounting volumes** if configured
4. **Starting your application**

Large container images take longer to pull. Railway caches images on compute nodes when possible, but the first deployment to a new node requires a full pull.

#### Network (healthchecks)

If you have a [healthcheck](/deployments/healthchecks) configured, Railway queries your healthcheck endpoint until it receives an HTTP 200 response. The default timeout is 300 seconds (5 minutes).

If your application takes time to:
- Initialize database connections
- Load large files into memory
- Warm up caches

...the healthcheck phase will reflect that startup time.

#### Post-deploy (drain instances)

Railway stops and removes the previous deployment. By default, old deployments are given 0 seconds to gracefully shut down (configurable via `RAILWAY_DEPLOYMENT_DRAINING_SECONDS`).
