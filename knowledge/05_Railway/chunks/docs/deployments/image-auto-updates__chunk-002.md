# Image Auto Updates (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/deployments/image-auto-updates.md
Original Path: docs/deployments/image-auto-updates.md
Section: docs
Chunk: 2/2

---

### Skip versions

If a specific version causes issues, you can skip it to prevent Railway from automatically updating to that version. Skipped versions will be excluded from future auto-update checks.

When prompted select the dropdown and click "Skip this version"

![Skip version dialog](https://res.cloudinary.com/railway/image/upload/v1767663458/skipversion_v7dcux.png)

## Notifications

When an automatic update is applied, workspace admins receive a notification containing:

- Service and environment name
- Previous version
- New version
- Update type

To disable these notifications, create a custom rule setting "ServiceInstance Auto Updated" to "None" for a project.
