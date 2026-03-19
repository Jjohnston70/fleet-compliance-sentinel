# Understanding Your Bill (Chunk 3/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/pricing/understanding-your-bill.md
Original Path: docs/pricing/understanding-your-bill.md
Section: docs
Chunk: 3/3

---

### High network egress

Network egress (outbound data transfer) is charged at $0.05/GB. Common causes of high egress:

- **Not using private networking for databases**: If your app connects to your Railway database using the public URL instead of the private URL, all that traffic counts as egress. Use `DATABASE_URL` (private) instead of `DATABASE_PUBLIC_URL`.
- **Large file transfers**: Serving large files, images, or videos directly from your service.
- **API responses**: High-traffic APIs returning large payloads.

**Solution:** Use [private networking](/networking/private-networking) for all service-to-service communication within Railway.

### PR deploys / ephemeral environments

When you have [PR deploys](/environments#ephemeral-environments) enabled, Railway creates a copy of your environment for each pull request. These environments run real services that consume real resources.

If you have 5 open PRs, you may be running 5x your normal workload.

**Solution:** Close PRs promptly or disable PR deploys if you don't need them.

### Idle services still running

Services consume resources even when not handling traffic. If you have development, staging, or test environments running continuously, they add up.

**Solution:** Enable [Serverless](/deployments/serverless) on services that don't need to be always-on, or delete unused services.

### Memory leaks

If your application has a memory leak, it will gradually consume more RAM over time until it hits limits or gets restarted. This inflates your memory costs.

**Solution:** Monitor your service metrics for growing memory usage and fix leaks in your application code.

## Related resources

- [Plans and Pricing](/pricing/plans) - Detailed pricing information
- [Pricing FAQs](/pricing/faqs) - Common pricing questions
- [Optimize Usage](/pricing/cost-control) - Guide to reducing costs
- [Usage Limits](/pricing/cost-control) - Set spending caps
- [Serverless](/deployments/serverless) - Auto-stop inactive services
- [Private Networking](/networking/private-networking) - Reduce egress costs
