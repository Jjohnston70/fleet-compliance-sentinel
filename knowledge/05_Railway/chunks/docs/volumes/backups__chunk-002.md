# Backups (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/volumes/backups.md
Original Path: docs/volumes/backups.md
Section: docs
Chunk: 2/2

---

## Caveats

Backups are a newer feature that is still under development. Here are some limitations of which we are currently aware:

- Backup incremental sizes are cached for a couple of hours when listed in the frontend, so they may show slightly stale data.
- Wiping a volume deletes all backups.
- Backups can only be restored into the same project + environment.
