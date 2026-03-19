# Use Cases (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/use-cases.md
Original Path: docs/platform/use-cases.md
Section: docs
Chunk: 2/2

---

### Metrics

Railway provides up to 7 days worth of data on service information such as:

- CPU
- Memory
- Disk Usage
- Network

We also overlay commit and deployment behavior to correlate issues with application health to deployments. This is on top of the service logs that are continually delivered to users viewing a particular deployment of a service.

For service logs, we store logs for up to 90 days for Pro plan workspaces.

It is common for teams who wish to have additional observability to use an additional monitoring tool that maintains a longer time horizon of data such as New Relic, Sentry, or Datadog. Within projects, deploying a Datadog Agent is as easy as deploying the template and providing your Datadog API Keys.

### Networking

Railway doesn't have a hard bandwidth limit to the broader internet.

We may throttle your outbound bandwidth and reach out to you when it exceeds 100GB/month to ensure the legitimacy of your workloads. If you need to control where your traffic is allowed to come from such as setting up firewall rules, we recommend setting up Cloudflare or an external load balancer/L7 application firewall to handle it.

Private networking bandwidth is un-metered.

### Service level objectives

Railway does meet SLOs for companies who have greater need for incident, support, and business planning responsiveness. We provide this via Business Class, offered as an add-on to Pro plans and included in all Enterprise plans. [More info.](/platform/support#business-class)

### Will Railway exist in 10 years?

A common question we get in conversations with (rightly) skeptical developers is the above question. Most documentation pages don't address the meta question of a company's existence but how we run _our_ business affects yours.

The short and simple answer is: **Yes**.

Railway aims to exist for a very long time. Railway has presence on existing public clouds, while also building out presence on co-location providers. As a company, we have been structured sustainably with a first principles approach to every expense while growing sustainably.

### Unsupported use-cases

Unfortunately, the Railway platform isn't yet well-equipped to handle the following verticals that require extensive Gov't certification or GPU compute:

- Government
- Traditional Banking
- Machine Learning Compute

## General recommendations

A document like this can only go so far. We have a standing invitation for any team who needs an extended scale use-case to reach out to us directly by e-mailing [team@railway.com](mailto:team@railway.com), or via the [Railway Discord server](https://discord.gg/railway). You can also schedule some time with us directly by clicking [here](https://cal.com/team/railway/work-with-railway?duration=30).

We would be happy to answer any additional questions you may have.
