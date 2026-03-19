# Template Best Practices (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/templates/best-practices.md
Original Path: docs/templates/best-practices.md
Section: docs
Chunk: 1/3

---

# Template Best Practices

Learn the best practices for template creation.

Creating templates can get complex, but these best practices will help you create templates that are easy to use and maintain.

## Checklist

Depending on the type of template, there are different things to consider:

- [Template and Service Icons](#template-and-service-icons)
- [Naming Conventions](#naming-conventions)
- [Private Networking](#private-networking)
- [Environment Variables](#environment-variables)
- [Health Checks](#health-checks)
- [Persistent Storage](#persistent-storage)
- [Authentication](#authentication)
- [Dry Code](#dry-code)
- [Workspace Naming](#workspace-naming)
- [Overview](#overview)

## Template and service icons

Template and service icons are important for branding and recognition, as they give the template a more professional look and feel.

Always use 1:1 aspect ratio icons or logos with transparent backgrounds for both the template itself and the services the template includes.

Transparent backgrounds ensure logos integrate seamlessly with Railway's interface and provide a more polished, professional appearance.

## Naming conventions

Naming conventions are important for readability and consistency; using proper names enhances the overall quality and credibility of your template.

Always follow the naming conventions for the software that the template is made for.

Example, if the template is for ClickHouse, the service and template name should be named `ClickHouse` with a capital C and H, since that is how the brand name is spelled.

For anything else, such as custom software:

- Use capital case.
- Avoid using special characters or dashes, space-delimited is the way to go.
- Prefer shorter names over longer names for better readability.
- Keep names concise while maintaining clarity.

## Private networking

Private networking provides faster, free communication between services and reduces costs compared to routing traffic through the public internet.

Always configure service-to-service communication (such as backend to database connections) to use private network hostnames rather than public domains.

For more details, see the [private networking guide](/networking/private-networking) and [reference documentation](/networking/private-networking).

## Environment variables

Properly set up environment variables are a great way to increase the usability of your template.

When using environment variables:

- Always include a description of what the variable is for.

- If a variable is optional, include a description explaining its purpose and what to set it to or where to find its value.

- For any secrets, passwords, keys, etc., use [template variable functions](/templates/create#template-variable-functions) to generate them, avoid hardcoding default credentials at all costs.

- Use [reference variables](/variables#referencing-another-services-variable) when possible for dynamic service configuration.

- When referencing a hostname, use the private network hostname rather than the public domain, e.g., `RAILWAY_PRIVATE_DOMAIN` rather than `RAILWAY_PUBLIC_DOMAIN`.

- Include helpful pre-built variables that the user may need, such as database connection strings, API keys, hostnames, ports, and so on.
