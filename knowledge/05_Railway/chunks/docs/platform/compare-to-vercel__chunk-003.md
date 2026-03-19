# Railway vs. Vercel (Chunk 3/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/compare-to-vercel.md
Original Path: docs/platform/compare-to-vercel.md
Section: docs
Chunk: 3/5

---

### Vercel

**Managing multiple services**

In Vercel, a project maps to a deployed application. If you would like to deploy multiple apps, you’ll do it by creating multiple projects.

![Vercel dashboard](https://res.cloudinary.com/railway/image/upload/v1753470540/docs/comparison-docs/vercel-dashboard_rmb3st.png)

**Integrating your application with external services**

If you would like to integrate your app with other infrastructure primitives (e.g storage solutions for your application’s database, caching, analytical storage, etc.), you can do it through the Vercel marketplace.

![Vercel marketplace](https://res.cloudinary.com/railway/image/upload/v1753470543/docs/comparison-docs/vercel-marketplace_cwrir6.png)

This gives you an integrated billing experience, however managing services is still done by accessing the original service provider. Making it necessary to switch back and forth between different dashboards when you’re building your app.

### Railway

**Managing projects**

In Railway, a project is a collection of services and databases. This can include frontend, API, background workers, API, analytics database, queues and so much more. All in a unified deployment experience that supports real-time collaboration.

![Railway canvas](https://res.cloudinary.com/railway/image/upload/v1737785173/docs/the-basics/project_canvas_dxpzxe.png)

**Databases**

Additionally, Railway has first-class support for Databases. You can one-click deploy any open-source database:

- Relational: Postgres, MySQL
- Analytical: Clickhouse, Timescale
- Key-value: Redis, Dragonfly
- Vector: Chroma, Weviate
- Document: MongoDB

Check out all of the [different storage solutions](https://railway.com/deploy?category=Storage) you can deploy.

Template directory

Finally, Railway offers a template directory that makes it easy to self-host open-source projects with just a few clicks. If you publish a template and others deploy it in their projects, you’ll earn a 25% kickback of their usage costs.

Check out all templates at [railway.com/deploy](http://railway.com/deploy)
