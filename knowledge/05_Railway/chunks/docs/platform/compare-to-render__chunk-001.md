# Railway vs. Render (Chunk 1/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/compare-to-render.md
Original Path: docs/platform/compare-to-render.md
Section: docs
Chunk: 1/5

---

# Railway vs. Render

Compare Railway and Render on infrastructure, pricing model and dashboard experience.

At a high level, both Railway and Render can be used to deploy your app. Both platforms share many similarities:

- You can deploy your app from a Docker image or by importing your app’s source code from GitHub.
- Multi-service architecture where you can deploy different services under one project (e.g. a frontend, APIs, databases, etc.).
- Services are deployed to a long-running server.
- Services can have persistent storage via volumes.
- Public and private networking are included out-of-the-box.
- Healthchecks are available to guarantee zero-downtime deployments.
- Connect your GitHub repository for automatic builds and deployments on code pushes.
- Create isolated preview environments for every pull request.
- Support for instant rollbacks.
- Integrated metrics and logs.
- Define Infrastructure-as-Code (IaC).
- Command-line-interface (CLI) to manage resources.
- Integrated build pipeline with the ability to define pre-deploy command.
- Support for wildcard domains.
- Custom domains with fully managed TLS.
- Schedule tasks with cron jobs.
- Run arbitrary commands against deployed services (SSH).
- Shared environment variables across services.

That said, there are some differences between the platforms that might make Railway a better fit for you.

## Scaling strategies

### Render

Render follows a traditional, instance-based model. Each instance has a set of allocated compute resources (memory and CPU).

In the scenario where your deployed service needs more resources, you can either scale:

- Vertically: you will need to manually upgrade to a large instance size to unlock more compute resources.
- Horizontally: your workload will be distributed across multiple running instances. You can either:
  - Manually specify the machine count.
  - Autoscale by defining a minimum and maximum instance count. The number of running instances will increase/decrease based on a target CPU and/or memory utilization you specify.

The main drawback of this setup is that it requires manual developer intervention. Either by:

- Manually changing instance sizes/running instance count.
- Manually adjusting thresholds because you can get into situations where your service scales up for spikes but doesn’t scale down quickly enough, leaving you paying for unused resources.
