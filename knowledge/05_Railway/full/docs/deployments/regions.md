Title: Regions
Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/deployments/regions.md
Original Path: docs/deployments/regions.md
Section: docs

---

# Regions

Deploy your apps across multiple Railway regions worldwide.

Railway's infrastructure spans multiple regions across the globe. This allows you to deploy your applications closer to your users no matter where they are located.

Consider factors like compliance needs and proximity to your users when choosing a region.

## Region options

Railway has deploy regions in the Americas, Europe, and Asia-Pacific to provide broad coverage around the world.

Within the service settings, you can select one of the following regions:

| Name                 | Location               | Region Identifier        |
| -------------------- | ---------------------- | ------------------------ |
| US West Metal        | California, USA        | `us-west2`               |
| US East Metal        | Virginia, USA          | `us-east4-eqdc4a`        |
| EU West Metal        | Amsterdam, Netherlands | `europe-west4-drams3a`   |
| Southeast Asia Metal | Singapore              | `asia-southeast1-eqsg3a` |

**Notes:**

- Additional regions may be added in the future as Railway continues expanding its infrastructure footprint.

- The region identifier is the value that can be used in your [Config as Code file](/config-as-code/reference#multi-region-configuration).

- By default, Railway deploys to your preferred region, which you can change in your [Account Settings](https://railway.com/workspace).

- All regions provide the same experience, performance, and reliability you expect from Railway.

## Impact of region changes

The region of a service can be changed at any time, without any changes to your domain, private networking, etc.

There will be no downtime when changing the region of a service, except if it has a volume attached to it (see below).

### Volumes

Volumes follow the region of the service to which they are attached. This means if you attach a new volume to a service, it will be deployed in the same region as the service.

If you change the region of a service with an attached volume, the volume will need to be migrated to the new region.

Note that this migration can take a while depending on the size of the volume, and will cause downtime of your service during that time.

The same is true if you attach a detached volume to a service in a different region. It will need to be migrated to the new region, which can take a while and cause downtime.

## Configuring regions

For information on how to deploy your services to different regions, refer to the [optimize performance guide](/deployments/optimize-performance#configure-a-region).
