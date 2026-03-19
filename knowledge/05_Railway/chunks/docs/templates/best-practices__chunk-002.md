# Template Best Practices (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/templates/best-practices.md
Original Path: docs/templates/best-practices.md
Section: docs
Chunk: 2/3

---

## Health checks

Health checks are important for ensuring that the service is running properly, before traffic is routed to it.

Although a health check might not be needed for all software, such as Discord bots, when it is applicable, it is a good idea to include a health check.

A readiness endpoint is the best option; if that's not possible, then a liveness endpoint should be used.

For more details, see the [healthchecks guide](/deployments/healthchecks) and [reference documentation](/deployments/healthchecks).

## Persistent storage

Persistent storage is essential for templates that include databases, file servers, or other stateful services that need to retain data across deployments.

Always include a volume for these services.

Without persistent storage, data will be lost between redeployments, leading to unrecoverable data loss for template users.

When configuring the service, ensure the volume is mounted to the correct path. An incorrect mount path will prevent data from being stored in the volume.

Some examples of software that require persistent storage:

- **Databases:** PostgreSQL, MySQL, MongoDB, etc.
- **File servers:** Nextcloud, ownCloud, etc.
- **Other services:** Redis, RabbitMQ, etc.

The volume mount location depends entirely on where the software expects it to be mounted. Refer to the software's documentation for the correct mount path.

For more details, see the [volumes guide](/volumes) and [reference documentation](/volumes).

## Authentication

Authentication is a common feature for many software applications, and it is crucial to properly configure it to prevent unauthorized access.

If the software provides a way to configure authentication, such as a username and password, or an API key, you should always configure it in the template.

For example, ClickHouse can operate without authentication, but authentication should always be configured so as not to leave the database open and unauthenticated to the public.

Passwords, API keys, etc. should be generated using [template variable functions](/templates/create#template-variable-functions), and not hardcoded.

## Dry Code

This is most applicable to templates that deploy from GitHub.

When creating templates that deploy from GitHub, include only the essential files needed for deployment. Avoid unnecessary documentation, example files, or unused code and configurations that don't contribute to the core functionality.

A clean, minimal repository helps users quickly understand the template's structure and make customizations when needed.
