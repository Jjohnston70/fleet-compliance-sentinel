# Variables Reference (Chunk 4/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/variables/reference.md
Original Path: docs/variables/reference.md
Section: docs
Chunk: 4/4

---

### User-provided configuration variables

Users can use the following environment variables to configure Railway's behavior.

| Name                                  | Description                                                                                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RAILWAY_DEPLOYMENT_OVERLAP_SECONDS`  | How long the old deploy will overlap with the newest one being deployed, its default value is `0`. Example: `20`                                                              |
| `RAILWAY_DOCKERFILE_PATH`             | The path to the Dockerfile to be used by the service, its default value is `Dockerfile`. Example: `Railway.dockerfile`                                                        |
| `RAILWAY_HEALTHCHECK_TIMEOUT_SEC`     | The timeout length (in seconds) of healthchecks. Example: `300`                                                                                                               |
| `RAILWAY_DEPLOYMENT_DRAINING_SECONDS` | The SIGTERM to SIGKILL buffer time (in seconds), its default value is 0. Example: `30`                                                                                        |
| `RAILWAY_RUN_UID`                     | The UID of the user which should run the main process inside the container. Set to `0` to explicitly run as root.                                                             |
| `RAILWAY_SHM_SIZE_BYTES`              | This variable accepts a value in binary bytes, with a default value of 67108864 bytes (64 MB)                                                                                 |
