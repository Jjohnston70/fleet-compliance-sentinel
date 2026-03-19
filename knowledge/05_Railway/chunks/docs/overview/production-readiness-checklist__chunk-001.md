# Production Readiness Checklist (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/overview/production-readiness-checklist.md
Original Path: docs/overview/production-readiness-checklist.md
Section: docs
Chunk: 1/3

---

# Production Readiness Checklist

Ensure your app is production-ready with this comprehensive Railway checklist.

_Is your application ready for production?_

In this page, this section explores key areas for production readiness, suggesting actions to take to address each one:

- [Performance and Reliability](#performance-and-reliability)
- [Observability and Monitoring](#observability-and-monitoring)
- [Quality Assurance](#quality-assurance)
- [Security](#security)
- [Disaster Recovery](#disaster-recovery)

---

## Performance and reliability

Ensuring your application is performant and reliable under changing conditions like load and external latency is critical for production-readiness. Consider taking the following actions to ensure your application is performant and reliable -

**&check; Serve your application from the right region**

- Deploying your application as close to your users as possible minimizes the number of network hops, reducing latency and improving performance.

  Railway offers multiple [deployment regions](/deployments/regions) around the globe.

  You may also consider implementing a CDN to cache server responses on an edge network.

**&check; Use private networking between services**

- When communicating between services over the public network, latency is introduced by the network hops that requests must make to reach their destination.

  To reduce latency, ensure communication between services in the same project and environment happens over the [private network](/networking/private-networking).

**&check; Configure a restart policy**

- Services can crash for different reasons, frequently due to unhandled exceptions in code, and it is important to implement a strategy to mitigate performance degradation and user impact.

  Ensure that you have properly configured your services [restart policy](/deployments/restart-policy).

**&check; Configure at least 2 replicas**

- If a service crashes or becomes unavailable due to a long-running request, your application could experience downtime or degraded performance.

  Increase the [number of replicas](/deployments/optimize-performance#configure-horizontal-scaling) to at least 2, so if one instance of your service crashes or becomes unavailable, there is another to continue handling requests.

**&check; Confirm your compute capacity**

- The vCPU and memory capacity of your services greatly impacts their ability to perform efficiently.

  The compute allocation for your services is handled automatically by Railway, and the limits are determined by your chosen subscription [plan](/pricing/plans#plans). You should review your plan limits and consider if upgrading is necessary to achieve the desired compute.

**&check; Consider deploying a database cluster or replica set**

- Data is critical to most applications, and you should ensure that the data layer in your stack is highly available and fault tolerant.

  Consider implementing a cluster or replica set, similar to the [Redis HA with Sentinel](https://railway.com/template/q589Jl) template, to ensure that your data remains available even if one node becomes unstable.

---
