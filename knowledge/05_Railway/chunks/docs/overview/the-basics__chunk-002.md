# The Basics (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/overview/the-basics.md
Original Path: docs/overview/the-basics.md
Section: docs
Chunk: 2/2

---

### Backups

If your service has a [volume](/overview/the-basics#volumes) attached, this is where you can manage backups.

Backups are incremental and Copy-on-Write, we only charge for the data exclusive to them, that aren't from other snapshots or the volume itself.

From here you can perform the following actions -

- Create a backup - Manually create a backup of the volume with a press of a button.

- Delete a backup - Remove a backup from the list via the backup's 3-dot menu.

- Lock a backup - Prevent a backup from being deleted via the backup's 3-dot menu.

- [Restore a backup](/volumes/backups#how-to-restore-a-backup) - Click the `Restore` button on the backup.

- Modify the backup schedule - Click the `Edit schedule` button on the header to make changes to the schedule.

### Service metrics

Service [Metrics](/observability/metrics) provide an essential overview of CPU, memory, and network usage for a given service.

### Service settings

This tab contains all the service level settings.

Some of the most commonly used service settings are -

- [Source](/services#service-source) - Here you can configure the deployment source, which can be either a GitHub repository with a specific branch or an image with optional credentials.

- [Networking](/networking/public-networking#railway-provided-domain) - Generate a Railway-provided domain or add your own custom one.

- Custom Build Command - Here you can configure a custom build command if you need to overwrite the default.

- Custom Start Command - Here, you can configure a custom start command if you need to overwrite the default.

## Deployments

[Deployments](/deployments) involve building and delivering your [Service](/overview/the-basics#services).

## Volumes

[Volumes](/volumes) are a feature that allows services on Railway to [maintain persistent data](/volumes).

### Volume metrics

Volume Metrics show the amount of data stored in the volume and its maximum capacity.

### Volume settings

This tab contains all the volume centric settings.

Some of the most commonly used volume settings are -

- Mount path - The absolute path where the volume will be mounted within the deployed service.

- Volume Size - Displays the current volume capacity and offers the option to expand it if your plan permits.

- Wipe Volume - This action wipes all data in the volume and then redeploys the connected service.

## What next?

If you've read enough for now and are ready to get started, check out either of these two resources next -

- [Quick Start guide](/quick-start) to deploy a To Do app from a [template](/templates).

- [Guides section](/overview/the-basics) to dive into how things work.

If you want to go deeper, click the Next button below to head to the next section - [Advanced Concepts](/overview/advanced-concepts).
