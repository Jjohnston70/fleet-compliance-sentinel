# Railway Metal (Chunk 3/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/railway-metal.md
Original Path: docs/platform/railway-metal.md
Section: docs
Chunk: 3/4

---

## Timeline

Railway's transition to Railway Metal will happen in phases. Here's what you can
expect:

| Date                         | What's Happening                                                                                                                                                          | Status |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Starting December 26th, 2024 | All new deploys on newly-created services without a [volume](/volumes) by Trial & Hobby users will use Railway Metal by default.                                | 🟢     |
| Starting January 1st, 2025   | We will be gradually upgrading services _without a [volume](/volumes)_ to Railway Metal. You can learn more about the gradual upgrade [here](#gradual-upgrade). | 🟢     |
| Starting January 31st, 2025  | All new deploys on all services _without a [volume](/volumes)_ by Trial & Hobby users will use Railway Metal by default.                                        | 🟢     |
| Starting February 14th, 2025 | All new deploys on all services _without a [volume](/volumes)_ by Pro & Enterprise users will use Railway Metal by default.                                     | 🟢     |
| Starting March 14th, 2025    | All new deploys on services _with a [volume](/volumes)_ by Trial & Hobby users will use Railway Metal by default.                                               | 🟢     |
| Starting March 21st, 2025    | We will begin migrating services to Railway metal for Hobby Users                                                                                                         | 🟢     |
| Starting March 28th, 2025    | All new deploys on services _with a [volume](/volumes)_ by Pro & Enterprise users will use Railway Metal by default.                                            | 🟢     |
| Starting May 2nd, 2025       | We will begin migrating services to Railway metal for Pro Users                                                                                                           | 🟢     |
| Starting June 6th, 2025      | We will begin migrating services to Railway metal for Enterprise Users                                                                                                    | 🟠     |

The migration is aimed to be completed by the 4th of July, 2025.

## Pricing updates

If you migrate 80 percent of your workloads to Railway Metal, you'll benefit from significantly reduced costs:

- **Egress Fees**: Reduced by 50%, from $0.10/GB to $0.05/GB.
- **Disk Storage**: Reduced from $0.25/GB to $0.15/GB.

These pricing updates are automatically applied once 80 percent of your workloads are running on Railway Metal.

## FAQ

### Is this a free upgrade?

Yes.

### How do I receive the upgrade sooner?

Go to your service's `Settings -> Deploy -> Regions`, and select any region
with the `Metal (New)` tag.

Refer to [Regions & Availability](#regions--availability) to see the regions
available for Railway Metal.

### How do I know if i'm on Railway metal?

To check if your service is running on Railway Metal, go to your service's
`Settings -> Deploy -> Regions`. If you are on Railway Metal, you will see a
`Metal (New)` tag next to the region.
