# Deploy Static Sites with Zero Configuration and Custom Domains (Chunk 3/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/static-hosting.md
Original Path: guides/static-hosting.md
Section: guides
Chunk: 3/3

---

## Add API endpoints with Railway functions

For static sites that need lightweight API endpoints, [Railway Functions](/functions) enable you to write and deploy code from the Railway canvas without managing infrastructure or creating a git repository.

Railway Functions are [Services](/services) that run a single file of TypeScript code using the [Bun](https://bun.com/) runtime. They're perfect for:

- Form submissions
- Simple API endpoints
- Webhook handlers
- Cron jobs

1. Add a new service:
   - In your Railway project, click the "+ Create" button
   - Choose "Function" as the service type
   - Deploy

2. Write your function:
   - Click on the "Source Code" tab
   - Write your function code

3. Deploy instantly:
   - Press `Cmd+S` (or `Ctrl+S`) to stage changes
   - Press `Shift+Enter` to deploy
   - Your function is live in seconds

Learn more about [Railway Functions](/functions).

For most static sites, the Hobby plan with included usage is sufficient. You only pay for resources you actually use.

Learn more about [Railway pricing](https://railway.com/pricing) and [usage optimization](/pricing/cost-control).

## Next steps

Now that you've deployed your static site, explore these resources:

- [Add a Database Service](/databases/build-a-database-service) for dynamic content
- [Monitor your application](/observability) with built-in metrics
- [Set up custom domains](/networking/public-networking) and SSL certificates
- [Configure environment variables](/variables) for different environments
- [Use Railway Functions](/functions) for API endpoints
- [Optimize performance](/deployments/optimize-performance) and [usage](/pricing/cost-control)

## Need help?

If you have any questions or run into issues, you can reach out in the [Railway Discord](http://discord.gg/railway) community or on [Central Station](https://station.railway.com/).
