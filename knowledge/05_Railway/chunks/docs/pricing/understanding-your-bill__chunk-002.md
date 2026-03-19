# Understanding Your Bill (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/pricing/understanding-your-bill.md
Original Path: docs/pricing/understanding-your-bill.md
Section: docs
Chunk: 2/3

---

## Understanding included usage

Both paid plans include a usage credit that offsets your resource consumption:

| Plan       | Subscription | Included Usage |
| ---------- | ------------ | -------------- |
| **Hobby**  | $5/month     | $5             |
| **Pro**    | $20/month    | $20            |

**How it works:**

1. Your subscription fee goes toward your resource usage
2. If usage stays within the included amount, you only pay the subscription fee
3. If usage exceeds the included amount, you pay the difference

**Examples (Hobby plan):**

| Resource Usage | Subscription | Included Usage Applied | Total Bill |
| -------------- | ------------ | ---------------------- | ---------- |
| $3             | $5           | $3                     | $5         |
| $5             | $5           | $5                     | $5         |
| $8             | $5           | $5                     | $8         |
| $15            | $5           | $5                     | $15        |

**Important:** Included usage credits reset each billing cycle. They do not accumulate or roll over to the next month. If you use $2 this month, you don't get $8 next month.

## Reading your invoice

Your Railway invoice contains several line items. Here's what each means:

### Subscription charges

The flat fee for your plan appears as a line item:
- "Hobby plan" - $5.00
- "Pro plan" - $20.00

Pro and Enterprise workspaces also show a per-seat line item:
- "Pro (per seat)" - $0.00 (seats are free, this line just shows the member count)

### Resource usage charges

Resources are listed by type with the unit and billing period:

| Line Item                             | Meaning                                      |
| ------------------------------------- | -------------------------------------------- |
| "Disk (per GB / min)"                 | Volume storage charges                       |
| "Network (per MB)"                    | Outbound data transfer (egress) charges      |
| "vCPU (per vCPU / min)"               | CPU usage charges                            |
| "Memory (per MB / min)"               | RAM usage charges                            |

Each line item shows the quantity used, unit price, and total amount for the billing period.

### Included usage

Your plan's included usage appears as a discount in the invoice summary:
- "Hobby plan included usage ($5.00 off)"
- "Pro plan included usage ($20.00 off)"

The amount in parentheses shows the maximum credit available. The actual discount applied equals your resource usage up to that maximum. For example, if your resource usage is $15.39 on the Pro plan, you'll see "-$15.39" applied even though the max is $20.00.

### Applied balance

"Applied balance" appears in the invoice summary when you have account credits or small amounts carried forward:

- **Credit applied**: If you have credits on your account (from refunds, promotions, or previous overpayments), they appear as a negative "Applied balance" reducing your amount due
- **Small amounts deferred**: If your total invoice is less than $0.50, Railway marks it as paid and carries the amount forward to your next invoice

### Tax and VAT

If applicable based on your billing location, you may see:
- "Sales Tax" or "VAT" as a separate line item

Ensure your [billing information](https://railway.com/workspace/billing) is accurate to receive correct tax assessment.

## Common causes of unexpected charges
