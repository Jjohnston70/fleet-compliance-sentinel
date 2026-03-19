# Deploy a Lovable App on Railway (Chunk 3/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/lovable.md
Original Path: guides/lovable.md
Section: guides
Chunk: 3/3

---

## Railway templates marketplace

The Railway templates marketplace provides pre-configured services that can be deployed alongside your Lovable application. Templates include databases, caching systems, message queues, and other infrastructure components commonly needed by web applications.

**Adding templates to your project:**

1. Navigate to your Railway project containing your Lovable application.
2. Click the **+ New** button to add a service.
3. Select **Template** to browse the marketplace.
4. Search for the service you need (PostgreSQL, Redis, MongoDB, etc.).
5. Click **Deploy** to add the template to your project.

The template service deploys in the same project as your Lovable application. Services within a project can communicate through [private networking](/networking/private-networking), and connection details are available as environment variables.

After deploying a template, configure your Lovable application to use the service by adding the connection variables to your Railway service's environment variables.

Browse available templates at the [Railway Templates marketplace](https://railway.com/deploy).

## Troubleshooting

**Deployment fails after Lovable changes:**

- Check Railway logs for build or runtime errors.
- Verify that environment variables are configured correctly.
- Ensure the repository connection remains intact (not renamed or moved).

**Changes in Lovable don't trigger Railway deployments:**

- Verify GitHub autodeploys are enabled in Railway's service settings.
- Check that the Lovable-GitHub connection is active in Lovable's integration settings.
- Confirm changes were committed to the default branch (`main`).

**Repository connection broken:**

- Lovable's GitHub sync breaks if the repository is renamed, moved, or deleted.
- Restore the repository to its original name and location.
- If deleted, [restore the repository on GitHub](https://docs.github.com/en/repositories/creating-and-managing-repositories/restoring-a-deleted-repository).

## Next steps

Explore these resources to enhance your Lovable application on Railway:

- [Add a Database Service](/databases/build-a-database-service)
- [Monitor your app](/observability)
- [Configure environment variables](/variables)
- [Set up custom domains](/networking/public-networking)
