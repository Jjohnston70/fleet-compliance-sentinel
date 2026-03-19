# Deployments (Chunk 3/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/deployments/reference.md
Original Path: docs/deployments/reference.md
Section: docs
Chunk: 3/3

---

## Railway initiated deployments

Occasionally, Railway will initiate a new deployment to migrate your service from one host to another. This may happen for one of three reasons:

1. At your plan tier, such as Trial or Hobby, you may be pre-emptively moved to a different host to help us optimize workload distribution.
2. A host requires security or performance updates and requires there to be no running workloads on the machine. We provide advance warning for these events.
3. A host has a fault and we migrate workloads off the machine to another to maintain customer service continutity.

We perform these migrations when implementing security patches or platform upgrades to the underlying infrastructure where your service was previously running. During platform-wide upgrades, your service might be redeployed multiple times as we roll out changes across Railway's infrastructure. These deployments are mandatory and cannot be opted out of.

These Railway-initiated deployments will display with a banner above the Active deployment to clearly identify them.

## Deployments paused - limited access

Railway's core offering is dynamic, allowing you to vertically or horizontally scale with little-to-no-notice. To offer this flexibility to customers, Railway takes the stance that Pro/Enterprise tiers may, in rare occasions, be prioritized above Free/Hobby tiers.

During periods where Pro/Enterprise users require additional resources, Railway may temporarily suspend resource allocation, including builds, to Free, and more rarely Hobby, customers.

### During a pause

- You'll see a "Limited Access" indicator in your dashboard
- New deployments will be queued rather than immediately processed
- All other Railway features remain fully functional
- No data or existing deployments are affected

### Continue deploying during high traffic

If you need to deploy immediately during a high traffic pause, you can upgrade to the Pro plan to bypass the deployment queue. Pro tier customers are not affected by deployment pausing and can continue deploying normally during high traffic periods.

### When normal operations resume

- Queued deployments will automatically process in order
- You'll receive a notification when deployment capabilities are restored
- No action is required on your part

## Support

For information on how to manage your deployments, explore [the guides in this section](/deployments).
