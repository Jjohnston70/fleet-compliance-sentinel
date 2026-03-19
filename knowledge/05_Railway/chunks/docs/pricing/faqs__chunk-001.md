# Pricing FAQs (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/pricing/faqs.md
Original Path: docs/pricing/faqs.md
Section: docs
Chunk: 1/3

---

# Pricing FAQs

General common Questions & Answers related to Railway's pricing.

General common Questions & Answers related to Railway's pricing.

### Can I try Railway without a credit-card?

Yes. As a new Railway user, you can sign up for a [Free Trial](/pricing/free-trial). You will receive a one-time grant of $5 to use on resources.

### What payment methods are accepted?

Railway only accepts credit cards for plan subscriptions. We also support custom invoicing for customers on the Enterprise plan.

### What will it cost to run my app?

With Railway, you are billed for the [subscription fee](/pricing/plans#plan-subscription-pricing) of the plan you're subscribed to, and the [resource usage](/pricing/plans#resource-usage-pricing) of your workloads.

To understand how much your app will cost to run on Railway, we recommend that you:

1. Deploy your project with the [Trial](/pricing/free-trial) or Hobby plan
2. Allow it to run for one week
3. Check your Estimated Usage in the [Usage Section](https://railway.com/workspace/usage) of your Workspace settings

Keeping it running for one week allows us to rack up sufficient metrics to provide you with an estimate of your usage for the current billing cycle. You can then use this information to extrapolate the cost you should expect.

We are unable to give exact quotes or estimates for how much it will cost to run your app because it is highly dependent on what you're deploying.

If you are supporting a commercial application, we highly recommend you to upgrade to the Pro plan for higher resource limits and access to [priority support](/platform/support#priority-threads).

### How do I prevent spending more than I want to?

Check out the [guide on cost control](/pricing/cost-control).

### Why is my resource usage higher than expected?

You can check your resource usage in the [Usage Section](https://railway.com/workspace/usage) of your Workspace settings. This includes a breakdown of your resource usage by project, along with the resource it's consuming (CPU, Memory, Network, etc.)

Common reasons for high resource usage include:

- Memory leaks in your application, causing it to consume more memory than necessary
- Higher traffic than usual, causing your app to consume more CPU and/or Network
- Certain templates or apps may be inherently more resource-intensive than others
- If you notice high egress cost in your bill, ensure that you are connecting to your Railway databases over [Private Networking](/networking/private-networking)
- If you have [PR deploys](/environments#ephemeral-environments) enabled in your project, Railway will deploy a mirror copy of your workload(s) based on the environment it forks from (`production` by default). You are billed for those workload(s) running in the ephemeral environment

Unfortunately, we are unable to assist with figuring out why your bill is higher than normal, as it is entirely dependent on what you have deployed. Resource usage is billed in a manner akin to how a utility company operates: they can tell you the amount of electricity you've consumed, but they can't explain the reasons for your high usage. Similarly, we can only provide information on the quantity of resources you consume, not the reasons behind it.
