# Migrate to Railway Metal (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/reference/migrate-to-railway-metal.md
Original Path: docs/reference/migrate-to-railway-metal.md
Section: docs
Chunk: 2/3

---

### What happens when my service is migrating?

When you change the value of the region within the service settings page, Railway is told to deploy into that region when the environment applies the staged change. In Railway's system, we process a deployment request from Railway's queue triggering a build.

Depending on if the service is Stateful or Stateless- we then initiate one of two bespoke migration processes.

**For Stateless:** Railway rebuilds your application onto Railway's Metal region, and after the container image is built, then is landed on a running host in one of Railway's datacenters.

**For Stateful:** Railway detects if a volume is mounted to your service, if a volume is detected, Railway initiates a volume migration and holds the deployment until the volume is ready to be mounted within the new region. The process is as follows:

1. Railway initiates a backup of the volume for internal and customer use.
2. Railway makes the backup of the volume accessible on the project canvas in the original region.
3. Railway then copies the volume into the new region.
4. (Optional) If there are backups in the volume, we also copy those backups into the new region. _Depending on the number and size of backups, this incurs a time penalty on the migration._
5. Railway then confirms the integrity of data.
6. Railway attempts a build of the deployment after the volume is confirmed to be accessible in the new region.
7. Railway mounts to the volume in the new region after a successful build.

During the process, as of 2025/05/13 - Railway is able to report the transfer speed and progress of the volume migration to users.

### What happens to writes on the db on migrations that I initiated?

Because Railway is copying the volume primitive using the same primitive that we use for the volume backup feature, writes persist until we unmount the running deployment of the DB. As such, you don't need to plan for downtime of your database except for the 30 to 40 seconds when a deployment remounts into the database.

## Preparing for migration

For production applications on Railway, we advise customers to make sure your service has configuration to ensure it's online between deployments. Railway by default, attempts to only deploy a new instance of your service only when your application is live and healthy. However, there are a number of additional measures you can take to increase resilience.

Before initiating a migration we recommend that users configure the following:

- [Healthchecks](/deployments/healthchecks)
- [Build and start commands](/builds/build-and-start-commands)
- [Volume Backups](/volumes/backups)
- [Deployment overlap](/variables/reference#user-provided-configuration-variables)
  - Configured by setting `RAILWAY_DEPLOYMENT_OVERLAP_SECONDS` within the Railway service variable settings

We also advise users to make sure that:

- Data is being written to disk instead of the ephemeral container storage
  - If unsure, you can check by SSHing into the container via the Railway CLI and running `ls` on the mount point.
- On your DB, that the version is pinned to a major version instead of `:latest` on the image source
- You are able to backup and restore your data
- You test in a development environment before you migrate your production environment

Railway is not responsible for data loss that occurs on re-deployment for data on the container's ephemeral disk.
