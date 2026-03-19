# Use Cases (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/use-cases.md
Original Path: docs/platform/use-cases.md
Section: docs
Chunk: 1/2

---

# Use Cases

Explore real-world use cases for deploying and managing applications on Railway.

Railway is suited for a variety of use-cases. This page will walk-through what the platform is perfect for today and Railway's recommendations for apps of all sizes.

As mentioned in the philosophy document. Railway will make a best effort to provide all the information a developer needs to make the best choice for their workload.

## Is Railway production ready?

Many of Railway's customers use Railway to reliably deploy their applications to customers at scale. With that said, Production standards are going to be different depending on what your users expect. We have companies that use Railway in a variety of different verticals such as:

- Enterprise SaaS
- Consumer Social
- Education
- E-Commerce
- Crypto
- ML/AI
- Agencies

Companies on Railway range from hobby projects, to extremely fast growing startups, to publicly traded companies. Railway has been incrementally adopted from using the platform as a developer's scratchpad before writing Terraform to hand off to an Ops. team or being implemented end to end.

Railway's been in operation for now for more than three years and we have served billions of requests, with 100s of millions of deploys serving millions of end-users simultaneously.

## Railway scale

All of these verticals deploy workloads that may require high bandwidth operations or intensive compute.

However, service scale on the platform is not unbounded. As a foundational infrastructure company, we understand that customers may outpace Railway's pace of improvement for the platform. Even though 24 vCPU and 24 GB of memory sounds like a lot (with up to 42 replicas) on the Pro plan, when faced with hyper-growth: throwing more resources at the issue might be your best bet until long term optimizations can be made by your team.

Railway will gladly bump up your service limits within your tier of service to meet your needs. Even so, we will be frank and honest if you may need to seek elsewhere to augment your workloads with extra compute. If your compute needs outpace the Pro offering, consider the Enterprise plans where we offer even greater limits and capacity planning, [email us to learn more](mailto:team@railway.com), or [click here](https://cal.com/team/railway/work-with-railway?duration=30) to schedule some time to chat.

### Databases

We have customers using Railway's databases for their production environment with no issue. Railway's databases are optimized for a batteries included development experience. They are good for applications that are prioritizing velocity and iteration speed over scale.

Railway's databases are provided with no SLAs, are not highly available, and scale only to the limits of your plan. We don't think they are suitable for anything mission-critical, like if you wanted to start a bank.

We advise developers to:

- [Configure backups](/volumes/backups)
- Run-book and restore their backups
- Configure secondaries to connect to in-case of a disaster situation

As mentioned before: we don't believe in vendor lock-in here at Railway, if your needs outpace us, consider other vendors like PlanetScale (for MySQL) or Cockroach (for Postgres).
