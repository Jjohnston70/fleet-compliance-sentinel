# Migrate from Render to Railway (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/migrate-from-render.md
Original Path: docs/platform/migrate-from-render.md
Section: docs
Chunk: 2/2

---

### 3. Database migration

Railway supports a variety of databases, including **PostgreSQL**, **MongoDB**, **MySQL**, and **Redis**, allowing you to deploy the one that best fits your application needs.

When a `render.yaml` file includes a `databases` section, Railway will automatically provision a **PostgreSQL database** for your app. If you're migrating data to Railway, you can follow these steps:

1. Export your database from Render using tools like `pg_dump`.
2. Import the data into Railway using `psql`.

For detailed instructions, check out [this comprehensive tutorial on migrating PostgreSQL data between services.](https://blog.railway.com/p/postgre-backup)

Once the migration is complete, update the `DATABASE_URL` environment variable in your Railway app to point to the new PostgreSQL database.

### 4. Multi-region deployments

If your app needs to use multi-region deployments, you can leverage Railway’s [multi-region replicas](/deployments/scaling#multi-region-replicas).

Enable this in the **Settings** section of your Railway service to keep your app close to users worldwide.

**Note:** Multi-region replicas is currently available to Pro users.

![Multi-region deployments](https://res.cloudinary.com/railway/image/upload/v1736366540/multiregiondeployments_pojcyf.png)

And that’s it. That’s all you need to migrate your app from Render to Railway.
