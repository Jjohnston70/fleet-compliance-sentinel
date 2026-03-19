# Railway Metal (Chunk 2/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/railway-metal.md
Original Path: docs/platform/railway-metal.md
Section: docs
Chunk: 2/4

---

## Regions & availability

Railway Metal is available to all users, including Trial & Hobby Plan users.

Each Railway Metal region is located in a datacenter that was chosen
strategically to provide the best possible performance and reliability.

We are in the process of expanding Railway Metal regions, and we expect to
have all regions available by the end of Q1'2025 (by 31 March 2025).

| Railway Metal Region       | Status    |
| -------------------------- | --------- |
| US West (California)       | 🟢 Active |
| US East (Virginia)         | 🟢 Active |
| Europe West (Amsterdam)    | 🟢 Active |
| Southeast Asia (Singapore) | 🟢 Active |

## Gradual upgrade

We will gradually move services without a [volume](/volumes)
to Railway Metal as we increase the pool of Railway's hardware and its capabilities.

When this happens, you may see a new deploy initiated by Railway in your service:

Because this is a new deploy of your latest Active deployment, the behaviour
will be the same as if you've manually issued a new deploy. As such, you may
notice that:

- There may be a brief downtime during the upgrade. To prevent this, ensure
  you have [Health Checks](/deployments/healthchecks) set up for your service

- All ephemeral storage (such as `/tmp`, etc.) will be wiped. To prevent this,
  use [Volume](/volumes) to store data persistently. All storage is
  considered ephemeral unless they're on a Railway Volume

Note that the above generally applies to deploying a new version of
your service. The upgrade to Railway Metal is irrelevant to the behaviour
you may run into above - they are the same as if you were to manually deploy
a new version of your service.

For services in `US West (Oregon)`, Railway will not move your service to
Railway Metal if your service [references another service](/variables#referencing-another-services-variable-example) with a volume.
This is to prevent any cross-regional networking latency spikes for your
service. Refer to [this FAQ](#im-experiencing-slow-network-performance-after-switching-to-us-west-california-railway-metal-region-what-should-i-do) for more information.

### Rollback

If you encounter any issues with your service after the upgrade, you can
rollback to the previous version by clicking `Rollback` button in the banner
above.

### Manual rollback

To rollback manually, modify your service's `Settings -> Deploy -> Regions`
and select regions without the `Metal (New)` tag.
