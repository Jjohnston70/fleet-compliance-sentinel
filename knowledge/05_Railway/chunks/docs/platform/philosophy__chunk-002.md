# Philosophy (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/philosophy.md
Original Path: docs/platform/philosophy.md
Section: docs
Chunk: 2/3

---

### Leave what you don't

Streamlined deployment workflows and sane defaults are inherited by every project in Railway out of the box; but as a team of engineers, we at Railway are very aware that what works for one project does not always work for another. Or sometimes, you just need to be in control - maybe you already have a workflow you like, or maybe you need to layer Railway into existing infrastructure, and abstractions only get in your way.

That's why we've designed the platform for flexibility, wherever you need it.

On Railway, you can use the default pattern for deployment or opt to use vendor. In fact, we will even support you in your effort to integrate Railway in a unique way. Here are a couple of use cases we've helped customers take advantage of -

- Deploying to Railway from GitLab CI/CD
- Supporting the development of a Terraform provider
- Region based routing to workloads via Cloudflare

We love working with Railway's customers to solve interesting use cases. If you're not seeing a track for you, get in touch at [team@railway.com](mailto:team@railway.com) and we'll find it!

## High-level architecture

As mentioned before, Railway at a high level takes your code, builds it, and throws it on running infrastructure on GCP. At a granular level Railway relies on a few systems to maintain workloads.

- Build Layer
  - Where archived folders of code or a Dockerfile (via GitHub or `railway up`) is sent to be built into an image
  - [Nixpacks](https://nixpacks.com/docs): the OSS software that reads your code and builds it via Nix
  - Image Registry: either via Dockerhub/GitHub packages, or a previously built image from Railway's Build servers
- Deployment Layer
  - Where images are ran in containers, images are pulled from the Build Layer
  - Databases on Railway are images + volumes mounted on a machine
  - Cron services are containers ran on a defined schedule
- Routing Layer
  - This is the system that Railway maintains that routes requests into your running containers and provides private networks to suites of containers.
- Logging Layer
  - A suite of machines networked running Clickhouse that store container logs. This is accessed when you open the service logs pane.
- Dashboard Layer
  - Infrastructure and code that is used to manage the above layers.
  - This also includes any monitors that Railway uses to maintain the state of the Deployment Layer to maintain application state. (ex. Removing a deployment.)

Your code will either be in some, or all steps depending on the amount of Railway that you choose to adopt.

### Operational procedures

Railway uses a suite of alerting vendors, additional internal tools, and PagerDuty to ensure uptime of Railway's services described above. You can see Railway's uptime on the [Instatus page](https://railway.instatus.com/). Operational incident management reports and RCAs are available by request for those on an Enterprise plan.

### Do I have to change how I write Code?

No, Railway is a deployment platform that works with your existing code. We don't require you to change how you write code or use any specific frameworks. We support all languages and frameworks that can be run in a Docker container or within Nixpacks.
