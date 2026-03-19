# Build a Database Service

Learn how to build a database service on Railway.

Railway's platform primitives allow you to build any type of service your system requires, including database services. This guide will walk you through the essential features to build your own database service.

For the purpose of this guide, you'll use the official [Postgres image](https://hub.docker.com/_/postgres) as an example.

## Service source

As discussed in the [Services guide](/services), a crucial step in creating a service is [defining a source](/services#defining-a-deployment-source) from which to deploy.

To deploy the official Postgres image, we'll simply enter postgres into the Source Image field:

## Volumes

Attach a [volume](/volumes) to any service, to keep your data safe between deployments. For the Postgres image, the default mount path is `/var/lib/postgresql/data`.

Just attach a volume to the service you created, at the mount path:

## Environment variables

Now, all you need to do is configure the appropriate [environment variables](https://hub.docker.com/_/postgres#environment-variables:~:text=have%20found%20useful.-,Environment%20Variables,-The%20PostgreSQL%20image) to let the Postgres image know how to run:

Note the `DATABASE_URL` is configured with TCP Proxy variables, but you can also connect to the database service over the private network. More information below.

## Connecting

### Private network

To connect to your database service from other services in your project, you can use the [private network](/networking/private-networking). For a postgres database service listening on port `5432`, you can use a connection string like this -

```bash
postgresql://postgres:password@postgres.railway.internal:5432/railway
```

### TCP proxy

If you'd like to expose the database over the public network, you'll need to set up a [TCP Proxy](/networking/public-networking#tcp-proxying), to proxy public traffic to the Postgres port `5432`:

## Conclusion

That's all it takes to spin up a Postgres service in Railway directly from the official Postgres image. Hopefully this gives you enough direction to feel comfortable exploring other database images to deploy.

Remember you can also deploy from a Dockerfile which would generally involve the same features and steps. For an example of a Dockerfile that builds a custom image with the official Postgres image as base, take a look at [Railway's SSL-enabled Postgres image repo](https://github.com/railwayapp-templates/postgres-ssl).

### Template marketplace

Need inspiration or looking for a specific database? The [Template Marketplace](https://railway.com/templates) already includes solutions for many different database services. You might even find a template for the database you need!

Here are some suggestions to check out -

- [Minio](https://railway.com/template/SMKOEA)
- [ClickHouse](https://railway.com/template/clickhouse)
- [Dragonfly](https://railway.com/template/dragonfly)
- [Chroma](https://railway.com/template/kbvIRV)
- [Elastic Search](https://railway.com/template/elasticsearch)
