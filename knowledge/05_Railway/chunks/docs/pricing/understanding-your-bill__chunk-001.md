# Understanding Your Bill (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/pricing/understanding-your-bill.md
Original Path: docs/pricing/understanding-your-bill.md
Section: docs
Chunk: 1/3

---

# Understanding Your Bill

Learn how Railway billing works, why you're charged when idle, and how to read your invoice.

This guide explains how Railway billing works in practice, helping you understand your charges and avoid unexpected costs.

## How Railway billing works

Your subscription fee ($5 Hobby, $20 Pro) is a minimum usage commitment. It covers your first $5 or $20 of resource usage each month.

At the end of each billing cycle:
- **Usage ≤ plan amount**: You owe nothing extra, just your subscription for the next month
- **Usage > plan amount**: You pay the difference between your actual usage and what your plan already covered

Your invoice combines two periods:
- **Subscription** (billed in advance): Your minimum commitment for the upcoming month
- **Usage overage** (billed in arrears): Any resource usage from the previous month that exceeded your plan's included amount

**Example (Pro plan):** Your December 21 invoice includes:
- $20 Pro subscription for Dec 21 – Jan 21 (next month)
- $0 overage if Nov 21 – Dec 21 usage was under $20, OR the amount over $20 if you exceeded it

In some cases, Railway may charge a partial amount earlier in the billing cycle to ensure your account remains in good standing and to help mitigate fraud.

## Why you're charged when your app has no traffic

A common question: "Why am I being charged when my app has no traffic?"

The key concept is that **you pay for allocated resources, not traffic**. When your service is running, it consumes CPU and RAM regardless of whether it's actively handling requests.

Think of it like electricity: you pay for appliances that are plugged in and running, not just when you're actively using them. A server running idle still uses memory to stay loaded and CPU cycles to stay responsive.

### Solutions to reduce idle costs

| Solution                                            | Description                                              |
| --------------------------------------------------- | -------------------------------------------------------- |
| [Serverless](/deployments/serverless)               | Automatically stops services when inactive               |
| [Usage Limits](/pricing/cost-control)             | Set spending caps to prevent unexpected charges          |
| Delete unused services                              | Remove services you no longer need                       |
| [Private Networking](/networking/private-networking)    | Reduce egress costs by keeping traffic internal          |
