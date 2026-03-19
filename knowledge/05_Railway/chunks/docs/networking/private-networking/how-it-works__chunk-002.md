# How Private Networking Works (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/networking/private-networking/how-it-works.md
Original Path: docs/networking/private-networking/how-it-works.md
Section: docs
Chunk: 2/2

---

## Build VS. Runtime

Private networking is only available at **runtime**, not during the build phase. This means:

- Build scripts cannot reach other services over the private network
- Database migrations that require internal connectivity should run as part of the start command, not the build
- Health checks and service discovery happen after deployment

## Performance characteristics

Private networking offers several performance advantages:

- **Lower latency**: Traffic stays within Railway's infrastructure
- **No public internet hops**: Direct service-to-service communication
- **No egress costs**: Internal traffic doesn't count toward egress billing

## Related

- [Private Networking Overview](/networking/private-networking) - Getting started with private networking
- [Domains](/networking/domains) - Configure public and private domains
- [Library Configuration](/networking/private-networking/library-configuration) - Configure libraries for dual-stack networking
