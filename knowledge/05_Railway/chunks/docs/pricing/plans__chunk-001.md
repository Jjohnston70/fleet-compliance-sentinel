# Pricing Plans (Chunk 1/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/pricing/plans.md
Original Path: docs/pricing/plans.md
Section: docs
Chunk: 1/4

---

# Pricing Plans

Learn about Railway's plans and pricing.

Railway plans and pricing are designed to give you maximum resources while only charging you for your usage. We charge a base subscription price, which goes towards your resources and usage.

## Plans

Railway offers four plans in addition to a [Trial](/pricing/free-trial):

|                |                                                                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Free**       | For running small apps with $1 of free credit per month                                                                                             |
| **Hobby**      | For indie hackers and developers to build and deploy personal projects                                                                             |
| **Pro**        | For professional developers and their teams shipping to production                                                                                 |
| **Enterprise** | For teams building and deploying production applications with the need for enterprise features related to compliance, SLAs, and account management |

### Subscription pricing

Each Railway account needs an active subscription. The base subscription fee allows you to use the Railway platform and features included in the tier of your subscription. The subscription fee goes towards your usage-costs on the platform.

| Plan           | Price       |
| -------------- | ----------- |
| **Free**       | $0 / month  |
| **Hobby**      | $5 / month  |
| **Pro**        | $20 / month |
| **Enterprise** | Custom      |

Read more about Railway's plans at [railway.com/pricing](https://railway.com/pricing).

Curious about potential savings? [Upload your current invoice](https://railway.com/pricing#pricing-invoice) and see how much you can save by running your workloads on Railway.

### Default plan resources

Depending on the plan you are on, you are allowed to use up these resources per service.

| Plan           | **Replicas** | **RAM**      | **CPU**        | **Ephemeral Storage** | **Volume Storage** | **Image Size** |
| -------------- | ------------ | ------------ | -------------- | --------------------- | ------------------ | -------------- |
| **Trial**      | **0**        | **1 GB**     | **2 vCPU**     | **1 GB**              | **0.5 GB**         | **4 GB**       |
| **Free**       | **0**        | **0.5 GB**   | **1 vCPU**     | **1 GB**              | **0.5 GB**         | **4 GB**       |
| **Hobby**      | **6**        | **48 GB**    | **48 vCPU**    | **100 GB**            | **5 GB**           | **100 GB**     |
| **Pro**        | **42**       | **1 TB**     | **1,000 vCPU** | **100 GB**            | **1 TB \***        | **Unlimited**  |
| **Enterprise** | **50**       | **2.4 TB**   | **2,400 vCPU** | **100 GB**            | **5 TB \***        | **Unlimited**  |

Note that these are maximum values and include replica multiplication.

\* For Volumes, Pro users and above can self-serve to increase their volume up to 250 GB. Check out [this guide](/volumes#live-resizing-the-volume) for information.
