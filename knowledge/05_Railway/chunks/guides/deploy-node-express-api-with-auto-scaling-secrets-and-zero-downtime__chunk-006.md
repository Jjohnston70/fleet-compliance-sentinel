# Deploy Node.js & Express API with Autoscaling, Secrets, and Zero Downtime (Chunk 6/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/deploy-node-express-api-with-auto-scaling-secrets-and-zero-downtime.md
Original Path: guides/deploy-node-express-api-with-auto-scaling-secrets-and-zero-downtime.md
Section: guides
Chunk: 6/6

---

## Deploy multiple services

Railway makes it easy to deploy multiple lightweight Node.js microservices without learning [Kubernetes](https://kubernetes.io/) or [Docker](https://www.docker.com/) orchestration. You can deploy several services within a single project to achieve a [microservice architecture](https://microservices.io/).

To add more microservices to your project:

1. In your Railway project, click the "+" button
2. Choose "Deploy from GitHub repo"
3. Select another repository containing a different Node.js service
4. Railway automatically detects and deploys each service independently

![Deploy multiple services](https://res.cloudinary.com/railway/image/upload/v1758274862/microservice_cpul8g.png)

Each service runs in its own container with its own resources, but they can communicate with each other through Railway's [private networking](/networking/private-networking).

### Shared variables between services

Railway supports shared variables across all services in a project, making it easy to share configuration like database URLs, API keys, and other common settings. Learn more about [configuration management patterns](https://12factor.net/config):

1. Go to your project's "Settings" → "Shared Variables"
2. Add variables that all services need (e.g., `DATABASE_URL`, `API_KEY`)
3. Each service can reference these shared variables using Railway's template syntax

For example, if you have a shared `DATABASE_URL` variable, any service can reference it with:
```bash
DATABASE_URL=${{shared.DATABASE_URL}}
```

This eliminates duplication and makes it easy to manage configuration across your entire microservice architecture.

Learn more about [managing services](/services), [shared variables](/variables#shared-variables), and [service communication](/services) in the Railway documentation.

## Conclusion

In this guide, you learned how to deploy Node.js and Express applications to production using Railway's zero-configuration deployment platform. You built:

- A production-ready Express REST API with automatic scaling
- A TypeScript application with automated builds
- Preview environments for every pull request

Railway makes Node.js deployment simple by providing:

- **Zero configuration**: Deploy from GitHub without Dockerfiles or complex setup
- **Automatic scaling**: Handle traffic spikes without manual intervention
- **Built-in CI/CD**: Preview environments and zero-downtime deployments
- **Usage-based pricing**: Pay only for what you use. Check out the Railway [pricing page](https://railway.com/pricing) for more details.

## Next steps

Now that you've deployed your Node.js applications, explore these resources:

- [Add a Database Service](/databases/build-a-database-service)
- [Monitor your application](/observability)
- [View logs and metrics](/observability/logs) and [metrics](/observability/metrics)
- [Set up custom domains](/networking/public-networking)
- [Configure environment variables](/variables)
- [Deploy with Docker](/builds/dockerfiles)
- [Customize builds](/builds)
- [Manage deployments](/integrations/api/manage-deployments)

## Need help?

If you have any questions or run into issues, you can reach out in the [Railway Discord](http://discord.gg/railway) community or on [Central Station](https://station.railway.com/).
