# Railway vs. Vercel (Chunk 2/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/compare-to-vercel.md
Original Path: docs/platform/compare-to-vercel.md
Section: docs
Chunk: 2/5

---

### Railway’s infrastructure

Railway's underlying infrastructure runs on hardware that’s owned and operated in data centers across the globe. By controlling the hardware, software, and networking stack end to end, the platform delivers best-in-class performance, reliability, and powerful features, all while keeping costs in check.

![Railway regions](https://res.cloudinary.com/railway/image/upload/v1753470545/docs/comparison-docs/railway-regions_syr9jf.png)

Railway uses a [custom builder](/builds) that takes your source code or Dockerfile and automatically builds and deploys it, without needing configuration.

Your code runs on a long-running server, making it ideal for apps that need to stay running or maintain a persistent connection.

All deployments come with smart defaults out of the box, but you can tweak things as needed. This makes Railway flexible across [different runtimes and programming languages](http://railway.com/deploy).

Each service you deploy can automatically scale up vertically to handle incoming workload. You also get the option to horizontally scale a service by spinning up replicas. Replicas can be deployed in multiple regions simultaneously.

You can also set services to start on a schedule using a crontab expression. This lets you run scripts at specific times and only pay for the time they’re running.

## Pricing model differences

Both platforms follow a usage-based pricing model, but are different due to the underlying infrastructure.

### Vercel

Vercel functions are billed based on:

- Active CPU: Time your code actively runs in milliseconds
- Provisioned memory: Memory held by the function instance, for the full lifetime of the instance
- Invocations: number of function requests, where you’re billed per request

Each pricing plan includes a certain allocation of these metrics.

This makes it possible for you to pay for what you use. However, since Vercel runs on AWS, the unit economics of the business need to be high to offset the cost of the underlying infrastructure. Those extra costs are then passed down to you as the user, so you end up paying extra for resources such as bandwidth, memory, CPU and storage.

### Railway

Railway follows a usage-based pricing model that depends on how long your service runs and the amount of resources it consumes.

```
Active compute time x compute size (memory and CPU)
```

![railway usage-based pricing](https://res.cloudinary.com/railway/image/upload/v1753470546/docs/comparison-docs/railway-usage-based-pricing_efrrjn.png)

If you spin up multiple replicas for a given service, you’ll only be charged for the active compute time for each replica.

Railway also has a [serverless](/deployments/serverless) feature, which helps further reduce costs when enabled. When a service has no outbound requests for over 10 minutes, it is automatically put to sleep. While asleep, the service incurs no compute charges. It wakes up on the next incoming request, ensuring seamless reactivation without manual effort. This makes it ideal for sporadic or bursty workloads, giving you the flexibility of a full server with the cost efficiency of serverless, with the benefit of only paying when your code is running.

## Deployment experience
