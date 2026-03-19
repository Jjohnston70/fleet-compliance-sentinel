# Private Networking (Chunk 3/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/private-networking.md
Original Path: docs/private-networking.md
Section: docs
Chunk: 3/3

---

## Legacy environments

Environments created before October 16th, 2025 are considered legacy environments and only support IPv6 addressing for private networking.

If you want to utilize private networking in a legacy environment, you will need to configure your service to bind to `::` (the IPv6 all-interfaces address). See the [Service Configuration](#service-configuration) section for more information on configuring your listener. This will continue to work after your environment receives IPv4 support.

## FAQ

## Troubleshooting

Having issues with private networking? Check out the [Troubleshooting guide](/troubleshooting) or reach out on the [Railway Discord](https://discord.gg/railway).
