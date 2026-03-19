# Railway vs. DigitalOcean App Platform (Chunk 2/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/compare-to-digitalocean.md
Original Path: docs/platform/compare-to-digitalocean.md
Section: docs
Chunk: 2/5

---

### Railway

Railway automatically manages compute resources for you. Your deployed services can scale up or down based on incoming workload without manual configuration of metrics/thresholds or picking instance sizes. Each plan includes defined CPU and memory limits that apply to your services.

You can scale horizontally by deploying multiple replicas of your service. Railway automatically distributes public traffic randomly across replicas within each region. Each replica runs with the full resource limits of your plan.

For example, if you're on the Pro plan, each replica gets 24 vCPU and 24 GB RAM. So, deploying 3 replicas gives your service a combined capacity of 72 vCPU and 72 GB RAM.

```bash
Total resources = number of replicas × maximum compute allocation per replica
```

Replicas can be placed in different geographical locations for multi-region deployments. The platform automatically routes public traffic to the nearest region, then randomly distributes requests among the available replicas within that region. No need to define compute usage thresholds.

You can also set services to start on a schedule using a crontab expression. This lets you run scripts at specific times and only pay for the time they’re running.

## Pricing

### DigitalOcean app platform

DigitalOcean App Platform follows a traditional, instance-based pricing. You select the amount of compute resources you need from a list of instance sizes where each one has a fixed monthly price.

![DigitalOcean App Platform instances](https://res.cloudinary.com/railway/image/upload/v1753470539/docs/comparison-docs/digital-ocean-instances_rdnbq1.png)

While this model gives you predictable pricing, the main drawback is you end up in one of two situations:

- Under-provisioning: your deployed service doesn’t have enough compute resources which will lead to failed requests.
- Over-provisioning: your deployed service will have extra unused resources that you’re overpaying for every month.

Enabling horizontal autoscaling can help with optimizing costs, but the trade-off will be needing to figure out the right amount of thresholds instead.

### Railway

Railway automatically scales your infrastructure up or down based on workload demands, adapting in real time without any manual intervention. This makes it possible to offer a usage-based pricing model that depends on active compute time and the amount of resources it consumes. You only pay for what your deployed services use.

```
Active compute time x compute size (memory and CPU)
```

You don’t need to think about instance sizes or manually configure them. All deployed services scale automatically.

![Railway usage-based pricing](https://res.cloudinary.com/railway/image/upload/v1753470546/docs/comparison-docs/railway-usage-based-pricing_efrrjn.png)

If you spin up multiple replicas for a given service, you’ll only be charged for the active compute time for each replica.

Railway also has a [serverless](/deployments/serverless) feature, which helps further reduce costs when enabled. When a service has no outbound requests for over 10 minutes, it is automatically put to sleep. While asleep, the service incurs no compute charges. It wakes up on the next incoming request, ensuring seamless reactivation without manual effort. This is ideal for workloads with sporadic or bursty traffic, so you only pay when your code is running.

## Developer workflow & CI/CD
