# Manage Volumes with the Public API (Chunk 1/1)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/integrations/api/manage-volumes.md
Original Path: docs/integrations/api/manage-volumes.md
Section: docs
Chunk: 1/1

---

# Manage Volumes with the Public API

Learn how to manage persistent volumes via the public GraphQL API.

Here are examples to help you manage persistent volumes using the Public API.

## Get project volumes

List all volumes in a project:

## Get volume instance details

Get details about a volume instance (volume in a specific environment):

## Create a volume

Create a new persistent volume attached to a service:

## Update a volume

Rename a volume:

## Update volume instance

Update the mount path for a volume instance:

## Delete a volume

This will permanently delete the volume and all its data.

## Volume backups

### List backups

Get all backups for a volume instance:

### Create a backup

### Restore from backup

### Lock a backup (prevent expiration)

### Delete a backup

## Backup schedules

### List backup schedules

## Common mount paths

| Use Case | Recommended Mount Path |
|----------|------------------------|
| PostgreSQL | `/var/lib/postgresql/data` |
| MySQL | `/var/lib/mysql` |
| MongoDB | `/data/db` |
| Redis | `/data` |
| General Storage | `/data` or `/app/data` |
