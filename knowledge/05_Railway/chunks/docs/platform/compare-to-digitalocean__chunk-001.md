# Railway vs. DigitalOcean App Platform (Chunk 1/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/compare-to-digitalocean.md
Original Path: docs/platform/compare-to-digitalocean.md
Section: docs
Chunk: 1/5

---

# Railway vs. DigitalOcean App Platform

Compare Railway and DigitalOcean App Platform on infrastructure, pricing model and deployment experience.

At a high level, both Railway and DigitalOcean App Platform can be used to deploy your app. Both platforms share many similarities:

- You can deploy your app from a Docker image or by importing your app’s source code from GitHub.
- Multi-service architecture where you can deploy different services under one project (e.g. a frontend, APIs, databases, etc.).
- Services are deployed to a long-running server.
- Public and private networking are included out-of-the-box.
- Healthchecks are available to guarantee zero-downtime deployments.
- Connect your GitHub repository for automatic builds and deployments on code pushes.
- Support for instant rollbacks.
- Integrated metrics and logs.
- Define Infrastructure-as-Code (IaC).
- Command-line-interface (CLI) to manage resources.
- Integrated build pipeline with the ability to define pre-deploy command.
- Support for wildcard domains.
- Custom domains with fully managed TLS.
- Run arbitrary commands against deployed services (SSH).
- Shared environment variables across services.
- Both platforms’ infrastructure runs on hardware that’s owned and operated in data centers across the globe.

That said, there are some differences between the platforms that might make Railway a better fit for you.

## Scaling strategies

### DigitalOcean app platform

DigitalOcean App Platform follows a traditional, instance-based model. Each instance has a set of allocated compute resources (memory and CPU).

In the scenario where your deployed service needs more resources, you can either scale:

- Vertically: you will need to manually upgrade to a large instance size to unlock more compute resources.
- Horizontally: your workload will be distributed across multiple running instances. You can either:
  - Manually specify the machine count.
  - Autoscale by defining a minimum and maximum instance count. The number of running instances will increase/decrease based on a target CPU and/or memory utilization you specify.

The main drawback of this setup is that it requires manual developer intervention. Either by:

- Manually changing instance sizes/running instance count.
- Manually adjusting thresholds because you can get into situations where your service scales up for spikes but doesn’t scale down quickly enough, leaving you paying for unused resources.

Beyond scaling, there are other notable limitations. DigitalOcean App Platform doesn’t natively support multi-region deployments. To achieve that, you must create separate instances in different regions and set up an external load balancer to route traffic appropriately.

Furthermore, services deployed to the platform do not offer persistent data storage. Any data written to the local filesystem is ephemeral and will be lost upon redeployment, meaning you'll need to integrate with external storage solutions if your application requires data durability.
