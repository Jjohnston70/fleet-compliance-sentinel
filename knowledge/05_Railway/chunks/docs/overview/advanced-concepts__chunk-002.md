# Advanced Usage (Chunk 2/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/overview/advanced-concepts.md
Original Path: docs/overview/advanced-concepts.md
Section: docs
Chunk: 2/4

---

### Deploy options

Some default options are applied when your application is deployed on Railway. They can change where your deployments are ran, how they are ran, and what happens to them while they're running. Here are some things you can change:

- [**Replicas**](/deployments/scaling#horizontal-scaling-with-replicas): By default, your deployment will go out with a single instance in your [preferred region](/deployments/optimize-performance#set-a-preferred-region). With replicas, you can deploy multiple instances of your application in one or more regions. The Railway network will load balance incoming requests between the available replicas and serve the ones closest to your users.
- **Deployment Region**: If you haven't configured any Replicas, your services will be deployed to the [preferred region](/deployments/optimize-performance#set-a-preferred-region) configured in your workspace. To change an individual service's region, go to Settings > Deploy > Regions.
- **Scheduled Executions**: If your deployment isn't a long-running service, like most web or backend services are, your deployment will be run once then exit. If the service is intended to be a repeated task, you can create a cron schedule under Settings > Deploy that will re-run your deployment according to the schedule. Each time it runs and exits successfully, it'll be marked as Completed.
- [**Serverless Deployments**](/deployments/serverless): By default, services are long-running and will continue to run unless they error. You can configure your services to pause if no traffic is going to them, and start it back up once a request comes in. Sleeping services don't incur resource usage. While your service is starting back up, the requests will be queued and delivered to the service once its fully up and running.
- [**Healthchecks**](/deployments/healthchecks): By default, as soon as your deployment is launched, it's considered "healthy". You can configure an endpoint path under Deploy > Healthcheck Path that Railway will fetch once it deploys your service to ensure that your service actually started up before it removes the previous deployment. This lets Railway know when your services are fully healthy and ready to receive traffic, so it doesn't start serving requests to a service that hasn't fully started yet.

## Networking

Constructing efficient networking setups yourself can be tricky and time-consuming to get right. Included in the Railway experience is fast networking that just works and can help you build more modular services.
