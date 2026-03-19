# Audit Logs (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/enterprise/audit-logs.md
Original Path: docs/enterprise/audit-logs.md
Section: docs
Chunk: 1/2

---

# Audit Logs

Learn more about how Railway keeps a record of actions in workspaces.

Audit logs provide a record of actions performed within your Railway [workspace](/projects/workspaces). This includes changes to projects, services, deployments, variables, and workspace settings.

Audit logs can be accessed by workspace admins through the [**Audit Logs**](https://railway.com/workspace/audit-logs) link in the workspace settings.

Audit logs help teams with:

- **Security:** Track who made changes to sensitive resources like environment variables, integrations, or workspace settings
- **Compliance:** Maintain records of all changes for regulatory requirements and internal policies
- **Troubleshooting:** Identify when and how changes were made to diagnose issues
- **Team Coordination:** Understand what changes team members are making across projects
- **Change Management:** Review the history of deployments and configuration changes

## Accessing audit logs

Audit logs are available at the workspace level and can be accessed by workspace admins through the workspace settings page.

To view audit logs:
1. Navigate to your workspace dashboard
2. Click on [**Audit Logs**](https://railway.com/workspace/audit-logs) in the sidebar

For more information about workspace roles and permissions, see the [Workspaces documentation](/projects/workspaces).

## Log contents

Each audit log entry contains detailed information about the action that was performed:

- **Event Type:** The type of action that occurred (e.g., service created, variable updated, deployment triggered)
- **Timestamp:** When the action was performed
- **Workspace:** The workspace where the action occurred
- **Project:** The project affected by the action (if applicable)
- **Environment:** The environment affected by the action (if applicable)
- **Event Data:** Specific details about the change, such as resource data that was created, modified, or deleted
- **Actor:** Information about who or what performed the action

### Actor types

Actions in audit logs can be performed by three types of actors:

- **User:** An action performed by a workspace or project member
- **Railway Staff:** An action performed by Railway's team (typically during support requests)
- **Railway System:** An automated action performed by Railway's platform (e.g., automatic updates, backups)

## Listing all audit logs event types

The complete documentation of all audit log event types and their descriptions can be retrieved using the [Railway GraphQL API](/integrations/api).

You can explore this information using the [GraphiQL playground](https://railway.com/graphiql):

```graphql
{
  auditLogEventTypeInfo {
    eventType
    description
  }
}
```

This query returns all available event types in audit logs, along with a description of what each event represents.
