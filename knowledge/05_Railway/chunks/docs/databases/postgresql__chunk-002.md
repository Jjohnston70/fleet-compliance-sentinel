# PostgreSQL (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/databases/postgresql.md
Original Path: docs/databases/postgresql.md
Section: docs
Chunk: 2/2

---

## Modifying the Postgres configuration

You can modify the Postgres configuration by using the [`ALTER SYSTEM`](https://www.postgresql.org/docs/current/sql-altersystem.html) command.

```txt
ALTER SYSTEM SET shared_buffers = '2GB';
ALTER SYSTEM SET effective_cache_size = '6GB';
ALTER SYSTEM SET maintenance_work_mem = '512MB';
ALTER SYSTEM SET work_mem = '32MB';
ALTER SYSTEM SET max_worker_processes = '8';
ALTER SYSTEM SET max_parallel_workers_per_gather = '4';
ALTER SYSTEM SET max_parallel_workers = '8';

-- Reload the configuration to save the changes
SELECT pg_reload_conf();
```

After running the SQL, you will need to restart the deployment for the changes to take effect.

You can restart the deployment by clicking the `Restart` button in the deployment's 3-dot menu.

## Increasing the SHM size

The SHM Size is the maximum amount of shared memory available to the container.

By default it is set to 64MB.

You would need to change the SHM Size if you are experiencing the following error -

```txt
ERROR: could not resize shared memory segment "PostgreSQL.1590182853" to 182853 bytes: no space left on device
```

You can modify the SHM Size by setting the `RAILWAY_SHM_SIZE_BYTES` variable in your service variables.

This variable is a number in bytes, so you would need to convert the size you want to use.

For example, to increase the SHM Size to 500MB, you would set the variable to `524288000`.

## Additional resources

While these templates are available for your convenience, they are considered unmanaged, meaning you have total control over their configuration and maintenance.

We _strongly encourage you_ to refer to the source documentation to gain deeper understanding of their functionality and how to use them effectively. Here are some links to help you get started:

- [PostgreSQL Documentation](https://www.postgresql.org/)
- [PostgreSQL High Availability Documentation](https://www.postgresql.org/docs/current/high-availability.html)
- [Repmgr Documentation](https://www.repmgr.org/docs/current/getting-started.html)
- [Pgpool-II Documentation](https://www.pgpool.net/docs/latest/en/html/)
