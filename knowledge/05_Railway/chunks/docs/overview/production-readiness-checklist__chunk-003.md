# Production Readiness Checklist (Chunk 3/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/overview/production-readiness-checklist.md
Original Path: docs/overview/production-readiness-checklist.md
Section: docs
Chunk: 3/3

---

## Security

Protecting your application and user data from malicious threats and vulnerabilities is mission-critical in production applications. Consider the following for peace of mind -

**&check; Use private networking**

- The easiest way to protect your services from malicious threats, is to keep them unexposed to the public network.

  Secure communication between services in the same project and environment by using the [private network](/networking/private-networking).

**&check; Implement a security layer**

- While Railway does have protections in place at the platform level, we do not currently offer a configurable service for users' applications.

  Consider using a service like Cloudflare that offers both WAF and DDoS mitigation, to protect your services against web threats and ensure availability and performance.

---

## Disaster recovery

Being prepared for major and unexpected issues helps minimize downtime and data loss. Consider taking the following actions to ensure you are prepared -

**&check; Set up an instance of your application in two regions**

- In the event of a major disaster, an entire region may become unavailable.

  Using [deployment regions](/deployments/regions), you can deploy an entire instance of your application in another region.

  To save on cost of running a separate instance of your application, use [App Sleep](/deployments/serverless) to turn down resource usage on the inactive services.

**&check; Regularly back up your data**

- Data is critical to preserve in many applications. You should ensure you have a backup strategy in place for your data.

  Enable and configure [backups](/volumes/backups) for your services with volumes to ensure you can restore your data in case of any data loss.

---

## Conclusion

Using a mix of native features and external tools, we hope you can feel confident that your applications on Railway meet the highest standards of performance, reliability, and security.

Remember, the Railway team is always here to assist you with solutions. Reach out in [Discord](https://discord.com/channels/713503345364697088/1006629907067064482) or over email at [team@railway.com](mailto:team@railway.com) for assistance.
