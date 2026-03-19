# Pricing Plans (Chunk 2/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/pricing/plans.md
Original Path: docs/pricing/plans.md
Section: docs
Chunk: 2/4

---

### Resource usage pricing

On top of the base subscription fee above, Railway charges for the resources that you consume.

You are only charged for the resources you actually use, which helps prevent runaway cloud costs and provides assurances that you're always getting the best deal possible on your cloud spend.

| Resource                                 | Resource Price                                        |
| ---------------------------------------- | ----------------------------------------------------- |
| **RAM**                                  | $10 / GB / month ($0.000231 / GB / minute)            |
| **CPU**                                  | $20 / vCPU / month ($0.000463 / vCPU / minute)        |
| **Network Egress**                       | $0.05 / GB ($0.000000047683716 / KB)                  |
| [**Volume Storage**](/volumes) | $0.15 / GB / month ($0.000003472222222 / GB / minute) |

To learn more about controlling your resource usage costs, read the FAQ on [How do I prevent spending more than I want to?](/pricing/faqs#how-do-i-prevent-spending-more-than-i-want-to)

## Included usage

The Hobby plan includes $5 of resource usage per month.

If your total resource usage at the end of your billing period is $5 or less, you will not be charged for resource usage. If your total resource usage exceeds $5 in any given billing period, you will be charged the delta.

Included resource usage is reset at the end of every billing cycle and does not accumulate over time.

**Examples**:

- If your resource usage is $3, your total bill for the cycle will be $5. You are only charged the subscription fee because your resource usage is below $5 and therefore included in your subscription
- If your resource usage is $7, your total bill for the cycle will be $7 ($5 subscription fee + $2 of usage), because your resource usage exceeds the included resource usage

Similarly, the Pro plan includes $20 of resource usage per month and the same examples and billing logic apply. If your usage stays within $20, you'll only pay the subscription fee. If it exceeds $20, you'll be charged the difference on top of the subscription.

### Additional services

Railway offers [Business Class Support](/platform/support#business-class) as an add-on service to the Pro plan. Business Class Support is included with Enterprise. [Contact us](mailto:team@railway.com?subject=Business%20Class%20Support) to get started.

## Image retention policy

Railway retains images for a period of time after a deployment is removed. This is to allow for rollback to a previous deployment.

| Plan             | **Policy**    |
| ---------------- | ------------- |
| **Free / Trial** | **24 hours**  |
| **Hobby**        | **72 hours**  |
| **Pro**          | **120 hours** |
| **Enterprise**   | **360 hours** |

When a deployment is removed, the image will be retained for the duration of the policy.

Rolling back a removed deployment within the retention policy will restore the previous image, settings, and all variables with a new deployment; no redeployment is required.

A removed deployment that is outside of the retention policy will not have the option to rollback; instead, you will need to use the redeploy feature. This will rebuild the image from the original source code with the deployment's original variables.
