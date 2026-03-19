# PostgreSQL (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/databases/postgresql.md
Original Path: docs/databases/postgresql.md
Section: docs
Chunk: 1/2

---

# PostgreSQL

Learn how to deploy a PostgreSQL database on Railway.

The Railway PostgreSQL database template allows you to provision and connect to a PostgreSQL database with zero configuration.

## Deploy

Add a PostgreSQL database to your project via the `ctrl / cmd + k` menu or by clicking the `+ New` button on the Project Canvas.

You can also deploy it via the [template](https://railway.com/template/postgres) from the template marketplace.

#### Deployed service

Upon deployment, you will have a PostgreSQL service running in your project, deployed from Railway's [SSL-enabled Postgres image](https://github.com/railwayapp-templates/postgres-ssl/pkgs/container/postgres-ssl), which uses the official [Postgres](https://hub.docker.com/_/postgres) image from Docker Hub as its base.

### Connect

Connect to the PostgreSQL server from another service in your project by [referencing the environment variables](/variables#referencing-another-services-variable) made available in the PostgreSQL service:

- `PGHOST`
- `PGPORT`
- `PGUSER`
- `PGPASSWORD`
- `PGDATABASE`
- `DATABASE_URL`

_Note, Many libraries will automatically look for the `DATABASE_URL` variable and use
it to connect to PostgreSQL but you can use these variables in whatever way works for you._

#### Connecting externally

It is possible to connect to PostgreSQL externally (from outside of the [project](/projects) in which it is deployed), by using the [TCP Proxy](/networking/tcp-proxy) which is enabled by default.

_Keep in mind that you will be billed for [Network Egress](/pricing/plans#resource-usage-pricing) when using the TCP Proxy._

### Modify the deployment

Since the deployed container is based on an image built from the official [PostgreSQL](https://hub.docker.com/_/postgres) image in Docker hub, you can modify the deployment based on the [instructions in Docker hub](https://hub.docker.com/_/postgres#:~:text=How%20to%20extend%20this%20image).

We also encourage you to fork the [Railway postgres-ssl repository](https://github.com/railwayapp-templates/postgres-ssl) to customize it to your needs, or feel free to open a PR in the repo!

## Backups and observability

Especially for production environments, performing regular backups and monitoring the health of your database is essential. Consider adding:

- **Backups**: Automate regular backups to ensure data recovery in case of failure. We suggest checking out the native [Backups](/volumes/backups) feature.

- **Observability**: Implement monitoring for insights into performance and health of your databases. If you're not already running an observability stack, check out these templates to help you get started building one:
  - [Prometheus](https://railway.com/template/KmJatA)
  - [Grafana](https://railway.com/template/anURAt)
  - [PostgreSQL Exporter](https://railway.com/template/gDzHrM)

## Extensions

In an effort to maintain simplicity in the default templates, we do not plan to add extensions to the PostgreSQL templates covered in this guide.

For some of the most popular extensions, like PostGIS and Timescale, there are several options in the template marketplace.

- [TimescaleDB](https://railway.com/template/VSbF5V)
- [PostGIS](https://railway.com/template/postgis)
- [TimescaleDB + PostGIS](https://railway.com/template/timescaledb-postgis)
- [pgvector](https://railway.com/template/3jJFCA)
