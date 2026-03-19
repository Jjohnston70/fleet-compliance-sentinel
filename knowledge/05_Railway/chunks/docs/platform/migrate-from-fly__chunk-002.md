# Migrate from Fly to Railway (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/migrate-from-fly.md
Original Path: docs/platform/migrate-from-fly.md
Section: docs
Chunk: 2/2

---

### 3. Database migration

Railway supports a variety of databases, including **PostgreSQL**, **MongoDB**, **MySQL**, and **Redis**, allowing you to deploy the one that best fits your application needs. We also support many more via the [templates marketplace](https://railway.com/templates).

If you're migrating data to Railway from Fly, you can follow these steps:

1. Provision a new database by right clicking on the dashboard canvas and selecting Postgres.
2. Export your data from Flyio
   - Use `flyctl` to connect to your Flyio Postgres instance
     - `fly postgres connect -a `
   - Use `pg_dump` to export your database
     - `pg_dump -Fc --no-acl --no-owner -h localhost -p 5432 -U  -d  -f flyio_db_backup.dump`
   - Use `pg_restore` to connect to your Railway database and restore the data from the dump.
     - `pg_restore -U  -h  -p  -W -F t -d  `

For detailed instructions, check out [this comprehensive tutorial on migrating PostgreSQL data between services.](https://blog.railway.com/p/postgre-backup)

Once the migration is complete, update the `DATABASE_URL` environment variable in your Railway app to point to the new PostgreSQL database and redeploy.

### 4. Replicas & multi-region deployments

In this [Fly.io app](https://github.com/unicodeveloper/gin/blob/main/fly.toml), the setting **`min_machines_running=2`** ensures that at least **two instances** of the service remain active. On Railway import, we automatically translate this configuration to ensure that two **service instances** are running without any extra setup.

![Replicas](https://res.cloudinary.com/railway/image/upload/v1737143335/replicas_zwtuwr.png)

If your app needs to use multi-region deployments, you can leverage Railway’s [multi-region replicas](/deployments/scaling#multi-region-replicas).

Enable this in the **Settings** section of your Railway service to keep your app close to users worldwide.

**Note:** Multi-region replicas is currently available to Pro users.

And that’s it. That’s all you need to migrate your app from Flyio to Railway.
