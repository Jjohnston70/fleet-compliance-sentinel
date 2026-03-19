# Audit Logs (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/enterprise/audit-logs.md
Original Path: docs/enterprise/audit-logs.md
Section: docs
Chunk: 2/2

---

## Exporting audit logs via the API

You can export audit logs programmatically using the [Railway GraphQL API](/integrations/api).

Use the `auditLogs` query to retrieve audit log entries for a specific workspace. You can test this query in the [GraphiQL playground](https://railway.com/graphiql):

```graphql
{
  auditLogs(workspaceId: "YOUR_WORKSPACE_ID") {
    edges {
      node {
        id
        eventType
        createdAt
        projectId
        environmentId
        payload
        context
      }
    }
    pageInfo {
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
    }
  }
}
```

For more information on using the GraphQL API, see the [Public API Guide](/integrations/api).

## Audit log retention

Audit logs are retained for different periods depending on your Railway plan:

| Plan                       | Retention Period |
| -------------------------- | ---------------- |
| **Free, Trial and Hobby**  | 48 hours         |
| **Pro**                    | 30 days          |
| **Enterprise**             | 18 months        |

For longer retention periods or custom log export solutions, consider upgrading to a higher plan or [contact us](https://railway.com/enterprise) to discuss Enterprise options.
