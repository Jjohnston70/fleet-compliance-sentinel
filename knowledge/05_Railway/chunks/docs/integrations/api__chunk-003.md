# Public API (Chunk 3/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/integrations/api.md
Original Path: docs/integrations/api.md
Section: docs
Chunk: 3/4

---

## Rate limits

In order to protect the Railway API from spam and misuse, we have established some basic rate limits. The current limits to the API are:

- **Requests per hour**: 100 RPH for Free customers, 1000 RPH for Hobby customers, 10000 RPH for Pro customers; custom for Enterprise.
- **Requests per second**: 10 RPS for Hobby customers; 50 RPS for Pro customers; custom for Enterprise.

To help you keep track of your usage, Railway sends a few headers with the response on each request.

| Header                | Description                                                                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| X-RateLimit-Limit     | The maximum number of API requests allowed per day.                                                                                                |
| X-RateLimit-Remaining | The number of API requests your token can make in the current window.                                                                              |
| X-RateLimit-Reset     | The time at which the current window ends and your remaining requests reset.                                                                       |
| Retry-After           | The amount of time after which you can make another request. This header is only sent once you've used up all your requests in the current window. |

## Tips and tricks

### Resource IDs

While building your queries, if you quickly need to copy resource IDs, you can hit `Cmd/Ctrl + K` within your project and copy the project/service/environment ID.

### The network tab

If you're unsure about what query/mutation to use for what you are trying to achieve, you can always do the action in the dashboard and look for the request in the network tab. As we use the same API internally, you can simply grab the name and then look for specific query in the introspected schema.

### External resources

1. The [awesome-graphql](https://github.com/chentsulin/awesome-graphql) repository is a great resource for all things GraphQL with implementations available across a variety of languages.
2. The [GraphQL Discord](https://discord.graphql.org/) is the official Discord channel for graphql.org with a lot of active members and specific help channels.

## Examples

To help you get started, we have provided example queries and mutations organized by resource type:

- [API Cookbook](/integrations/api/api-cookbook) - Quick reference for common operations
- [Manage Projects](/integrations/api/manage-projects) - Create, update, delete projects
- [Manage Services](/integrations/api/manage-services) - Create services, configure settings
- [Manage Deployments](/integrations/api/manage-deployments) - Deploy, rollback, view logs
- [Manage Variables](/integrations/api/manage-variables) - Set and manage environment variables
- [Manage Environments](/integrations/api/manage-environments) - Create and configure environments
- [Manage Domains](/integrations/api/manage-domains) - Add custom domains, configure DNS
- [Manage Volumes](/integrations/api/manage-volumes) - Create volumes, manage backups
