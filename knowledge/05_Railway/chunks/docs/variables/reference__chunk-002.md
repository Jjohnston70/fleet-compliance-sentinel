# Variables Reference (Chunk 2/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/variables/reference.md
Original Path: docs/variables/reference.md
Section: docs
Chunk: 2/4

---

| Name                           | Description                                                                                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RAILWAY_PUBLIC_DOMAIN`        | The public service or customer domain, of the form `example.up.railway.app`                                                                          |
| `RAILWAY_PRIVATE_DOMAIN`       | The private DNS name of the service.                                                                                                                 |
| `RAILWAY_TCP_PROXY_DOMAIN`     | (see [TCP Proxy](/networking/tcp-proxy) for details) The public TCP proxy domain for the service, if applicable. Example: `roundhouse.proxy.rlwy.net` |
| `RAILWAY_TCP_PROXY_PORT`       | (see [TCP Proxy](/networking/tcp-proxy) for details) The external port for the TCP Proxy, if applicable. Example: `11105`                             |
| `RAILWAY_TCP_APPLICATION_PORT` | (see [TCP Proxy](/networking/tcp-proxy) for details) The internal port for the TCP Proxy, if applicable. Example: `25565`                             |
| `RAILWAY_PROJECT_NAME`         | The project name the service belongs to.                                                                                                             |
| `RAILWAY_PROJECT_ID`           | The project id the service belongs to.                                                                                                               |
| `RAILWAY_ENVIRONMENT_NAME`     | The environment name of the service instance.                                                                                                        |
| `RAILWAY_ENVIRONMENT_ID`       | The environment id of the service instance.                                                                                                          |
| `RAILWAY_SERVICE_NAME`         | The service name.                                                                                                                                    |
| `RAILWAY_SERVICE_ID`           | The service id.                                                                                                                                      |
| `RAILWAY_REPLICA_ID`           | The replica ID for the deployment.                                                                                                                   |
| `RAILWAY_REPLICA_REGION`       | The region where the replica is deployed. Example: `us-west2`                                                                                        |
| `RAILWAY_DEPLOYMENT_ID`        | The ID for the deployment.                                                                                                                           |
| `RAILWAY_SNAPSHOT_ID`          | The snapshot ID for the deployment.                                                                                                                  |
| `RAILWAY_VOLUME_NAME`          | The name of the attached volume, if any. Example: `foobar`                                                                                           |
| `RAILWAY_VOLUME_MOUNT_PATH`    | The mount path of the attached volume, if any. Example: `/data`

|
