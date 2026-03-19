# Advanced Usage (Chunk 3/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/overview/advanced-concepts.md
Original Path: docs/overview/advanced-concepts.md
Section: docs
Chunk: 3/4

---

### Private networking

[Private Networking](/networking/private-networking) is a feature that lets your services communicate to other running services within your project simply by its service name. Under Settings > Networking, you can configure the specific domain that is given to your service. You can provide this private networking domain name to your services with [Reference Variables](/variables#reference-variables).

Private Networking domains are available with [Railway-provided Variables](/variables#railway-provided-variables) that you can [provide to your other services](/variables#referencing-a-shared-variable), elimiating the need to hard-code their values.

Under the hood, Railway connects your services together with a WireGuard mesh and a DNS resolver that is scoped to your project and environment. Services running inside of one project or environment aren't able to reach the services running in a different project. This also applies to environments within a project being unable to reach other environments.

### Railway-provided domains

Railway provides a [customizable, Railway-branded domain](/networking/public-networking#railway-provided-domain) for your service that you can connect to a port running on your service and instantly make it available to the public internet. These domains require no DNS configuration on your end, and are perfect if you don't have a custom domain of your own just yet but still want to access your application.

### Custom domains

If you have a [custom domain](/networking/public-networking#custom-domains) that you've bought from a domain registrar, you can connect this to your Railway service to serve your application under. Railway will walk you through the configuration of the required DNS records, alert you if the configuration is wrong, and automatically provision SSL certificates for you so you can serve your application with `https://`.

## Integrations

Integrations let you interact with your Railway workspace outside of the Railway dashboard.

### CLI

The Railway CLI lets you interact with your Railway project from your local machine on the command line, allowing you to do things like:

- Triggering deployments programmatically
- Run your services locally using configured environment variables from your Railway project
- Launch new Railway projects from the terminal
- Deploy [templates](/templates)

### Public API

The Railway [public API](/integrations/api) is built with GraphQL and is the same API that powers the Railway dashboard. Similar to the CLI, you can interact with your Railway project programmatically by communicating with the API.

### Webhooks

Projects can also configure [Webhook URLs](/observability/webhooks) that can receive a number of events that are triggered by your services and other things inside your project. Using these in tandem with the Railway API can make some powerful workflows that respond to the rest of your project. They can also be used to deliver critical alerts to your team's Slack workspaces.
