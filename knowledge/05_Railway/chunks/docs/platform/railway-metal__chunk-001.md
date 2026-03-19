# Railway Metal (Chunk 1/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/railway-metal.md
Original Path: docs/platform/railway-metal.md
Section: docs
Chunk: 1/4

---

# Railway Metal

Railway Metal is Railway’s own cloud infrastructure, built for high-performance, scalable, and cost-efficient app deployments. Learn how it works.

Railway Metal is the next generation of Railway's underlying infrastructure.
It is built on hardware that we own and operate in datacenters around the world.

Learn more about how we built it in the blog post [So You Want to Build Your Own Data Center](https://blog.railway.com/p/data-center-build-part-one).

## Why?

We are making this move as part of Railway's commitment to providing best-in-class
infrastructure for Railway's users. This change enables us to improve the Railway platform's
performance, unlock additional features, increase reliability, and make
Railway more cost-effective for all users.

With Railway Metal, you can expect the following benefits:

- **Regions for Trial & Hobby plan users**: Railway Metal will be available to
  all users, including Trial & Hobby Plan users. Trial & Hobby plan users will
  be able to deploy services on all fRailway Metal regions in the US,
  Europe, and Southeast Asia.

- **Cheaper Pricing**: Running Railway's own hardware lets us reduce prices. Once
  Railway Metal is Generally Available, all users can expect to pay up to 50%
  less for Network Egress, and up to 40% less for Disk Usage.

- **Improved Performance**: Services on Railway will run faster. Railway's new CPUs
  are more powerful with higher core count and better performance per-core.
  Volume read/write performance will also be significantly faster as all
  of Railway's disks are NVMe SSDs, which are faster than the disks we could offer
  before.

- **Enhanced Reliability**: With Railway Metal, we are able to manage the
  hardware, software, and networking stack end-to-end. This allows us to move
  faster and fix problems more quickly. (For instance, before Railway Metal,
  incidents such as [a single host failure](https://status.railway.com/cm44jp6qh00jydhwlyxsix3vl) would often take us ~60 minutes to bring the host back up. With Railway's own
  hardware, we can bring the host back up significantly faster.)

- **Improved Networking**: We connect directly to major internet providers and
  other cloud platforms worldwide, giving you faster connections in and out
  of Railway.

- **Higher Available Resources**: Railway Metal has greater capacity that we
  will be increasing over time, allowing us to offer you more computing
  resources on-demand.

- **Unlocks More Features**: With Railway's own hardware and networking stack, we
  can power more advanced features that were not possible before, such as
  Static Inbound IPs, Anycast Edge Network, High-Availability Volumes, etc.

## Metal edge network

Railway routes traffic through its own anycast Metal Edge network.

You can check if its enabled for your service in the Public Network section in the service settings tab.

Screenshot showing a domain with the Metal Edge Network enabled

Benefits include better routing, less latency, and underlying infrastructure improvements.
