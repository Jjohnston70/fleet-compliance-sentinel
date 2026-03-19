# Railway vs. Fly (Chunk 1/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/compare-to-fly.md
Original Path: docs/platform/compare-to-fly.md
Section: docs
Chunk: 1/6

---

# Railway vs. Fly

Compare Railway and Fly.io on deployment model, scaling, pricing and developer workflow.

At a high level, both Railway and Fly.io can be used to deploy your app. Both platforms share several similarities:

- You can deploy your app from a Docker image or by importing your app’s source code from GitHub.
- Apps are deployed to a long-running server.
- Apps can have persistent storage through volumes.
- Public and private networking are included out-of-the-box.
- Multi-region deployments.
- Both platforms’ infrastructure runs on hardware that’s owned and operated in data centers across the globe.
- Healthchecks to guarantee zero-downtime deployments.

That said, there are differences between both platforms when it comes to the overall developer experience that can make Railway a better fit for you.

## Deployment model & scaling

### Fly

When you deploy your app to Fly, your code runs on lightweight Virtual Machines (VMs) called [Fly Machines](https://fly.io/docs/machines/). Each machine needs a defined amount of CPU and memory. You can either choose from [preset sizes](https://fly.io/docs/about/pricing/#started-fly-machines) or configure them separately, depending on your app’s needs.

Machines come with two types of virtual CPUs: `shared` and `performance`.

Shared CPUs are the more affordable option. They guarantee a small slice of CPU time (around 6%) but can burst to full power when there’s extra capacity. This makes them ideal for apps that are mostly idle but occasionally need to handle traffic, like APIs or web servers. Just keep in mind that heavy usage can lead to throttling.

Performance CPUs, by contrast, give you dedicated access to the CPU at all times. There’s no bursting or throttling, making them a better choice for workloads that require consistent, high performance.

**Scaling your app**

When scaling your app, you have one of two options:

- Scale a machine’s CPU and RAM: you will need to manually pick a larger instance. You can do this using the Fly CLI or API.
- Increase the number of running machines. There are two options:
  - You can manually increase the number of running machines using the Fly CLI or API.
  - Fly can automatically adjust the number of running or created Fly Machines dynamically. Two forms of autoscaling are supported.
    - Autostop/autostart Machines: You create a “pool” of Machines in one or more regions and Fly’s Proxy start/suspend Machines based on incoming requests. With this option, Machines are never created or deleted, you need to specify how many machines your app will need.
    - Metrics-based autoscaling: this is not supported out-of-the-box. However, you can deploy [`fly-autoscaler`](https://github.com/superfly/fly-autoscaler) which polls metrics and automatically creates/deletes or starts/stops existing Machines based on the metrics you define.

![Scaling your app on Fly.io](https://res.cloudinary.com/railway/image/upload/v1753083711/docs/scaling-your-app-on-fly_pe6clo.png)
