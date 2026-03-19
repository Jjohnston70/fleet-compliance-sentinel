# Railway Metal (Chunk 4/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/railway-metal.md
Original Path: docs/platform/railway-metal.md
Section: docs
Chunk: 4/4

---

### Is Railway metal stable?

Yes. We have been running a growing amount of deployments on it for the past
several months. As of the time of this writing, there are ~40,000 deployments
on Railway Metal, and we have not seen any significant issues.

### Is there downtime if I upgrade?

Upgrading to Railway Metal re-deploys your service. This may cause a brief
period of downtime as your new deploy is being set up. You can set up
[Health Checks](/deployments/healthchecks) to prevent this.

### What is the difference between Railway metal and regions?

Railway Metal refers to Railway's own hardware and infrastructure. Regions refer to
the physical location of the datacenter where the hardware is located.

### I'm experiencing slow network performance after switching to us west (california) Railway metal region. What should I do?

You may experience increased latency if your application is communicating with
other services (such as databases) in `US West (Oregon)`. This is caused by the
physical distance between Oregon (the current region) and California
(Railway Metal region).

We recommend switching back to the `US West (Oregon)` region if you are
experiencing increased latency after upgrading to `US West (California)`.
See [Manual rollback](#manual-rollback) for instructions.

### Will Railway stay on gcp?

No. We are migrating completely onto Railway managed hardware. For customers who would like Railway to deploy into their public cloud, you can contact sales via the [AWS Marketplace listing.](https://aws.amazon.com/marketplace/pp/prodview-cnib4vbrfgs5a)

### Help! After migrating, why do I have increased latency?

It's likely that your database, or service with a volume, isn't migrated over to Metal. Stateful Metal is available starting March 2025. Users who migrate to a different region other than their stateful workload will see increased latency due to the additional physical distance from your service's region. Migrate when your desired region has stateful workloads available after March 2025.

### Why did my costs increase when moving to metal?

Although not intended, Railway Metal, has a different metrics sampler than the legacy hardware. This means that metrics will be quicker to come in, this also meant that legacy was undercounting the amount of resources on the previous hardware. As a result, some metrics like CPU will increase, others, like RAM will usually decrease.

### How do I opt-out?

There is no way to opt-out of Railway Metal. Please [reach out to us](#getting-help)
if you have any concerns.

## Getting help

Please reach out to us [on the Railway Help Station](https://station.railway.com/feedback/feedback-railway-metal-a41f03a1) if you run into any issues. You can also reach out to us over [Slack](/platform/support#slack) if you are
a Pro or [Business Class / Enterprise](/platform/support#business-class)
customer.
