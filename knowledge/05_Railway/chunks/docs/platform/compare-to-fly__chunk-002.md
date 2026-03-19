# Railway vs. Fly (Chunk 2/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/compare-to-fly.md
Original Path: docs/platform/compare-to-fly.md
Section: docs
Chunk: 2/6

---

### Railway

Railway automatically manages compute resources for you. Your deployed services can scale up or down based on incoming workload without manual configuration of metrics/thresholds or picking instance sizes. Each plan includes defined CPU and memory limits that apply to your services.

You can scale horizontally by deploying multiple replicas of your service. Railway automatically distributes public traffic randomly across replicas within each region. Each replica runs with the full resource limits of your plan.

For example, if you're [on the Pro plan](/pricing/plans), each replica gets 24 vCPU and 24 GB RAM. So, deploying 3 replicas gives your service a combined capacity of 72 vCPU and 72 GB RAM.

```text
Total resources = number of replicas × maximum compute allocation per replica
```

Replicas can be placed in different geographical locations. The platform automatically routes public traffic to the nearest region, then randomly distributes requests among the available replicas within that region.

<video
src="https://res.cloudinary.com/railway/video/upload/v1753083716/docs/replicas_dmvuxp.mp4"
muted
autoplay
loop
controls>

Add replicas to your service

You can also set services to start on a schedule using a crontab expression. This lets you run scripts at specific times and only pay for the time they’re running.

## Pricing

### Fly

Fly charges for compute based on two primary factors: machine state and CPU type (`shared` vs. `performance`).

Machine state determines the base charge structure. Started machines incur full compute charges, while stopped machines are only charged for root file system (rootfs) storage. The rootfs size depends on your OCI image plus [containerd](https://containerd.io/) optimizations applied to the underlying file system.

[Pricing for different preset sizes is available in Fly's documentation](https://fly.io/docs/about/pricing/#started-fly-machines). You can get a discount by reserving compute time blocks. This requires paying the annual amount upfront, then receiving monthly credits equal to the "per month" rate. Credits expire at month-end and do not roll over to subsequent months. The trade-off is you might end up paying for unused resources.

![Fly compute presets pricing](https://res.cloudinary.com/railway/image/upload/v1753083710/docs/fly-pricing_fpda5v.png)

One important consideration is that Fly Machines incur cost based _on running time_. Even with zero traffic or resource utilization, you pay for the entire duration a machine remains in a running state. While machines can be stopped to reduce costs, any time spent running generates full compute charges regardless of actual usage.
