# Introduction to GraphQL (Chunk 3/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/integrations/api/graphql-overview.md
Original Path: docs/integrations/api/graphql-overview.md
Section: docs
Chunk: 3/3

---

### Using JavaScript

```javascript
const response = await fetch("https://backboard.railway.com/graphql/v2", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.RAILWAY_TOKEN}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    query: `query { me { name email } }`,
  }),
});

const { data, errors } = await response.json();
```

### Using Python

```python
import os
import requests

response = requests.post(
    "https://backboard.railway.com/graphql/v2",
    headers={
        "Authorization": f"Bearer {os.environ['RAILWAY_TOKEN']}",
        "Content-Type": "application/json",
    },
    json={
        "query": "query { me { name email } }",
    },
)

data = response.json()
```

## Tips for getting started

**Start small.** Write a simple query that fetches one thing. Once that works, gradually expand to include related data.

**Read the errors.** GraphQL error messages are specific and helpful. If you misspell a field or pass the wrong type, the error tells you exactly what went wrong and what's valid.

**Think in graphs.** Instead of "what endpoint do I call?", think "what data do I need, and how is it connected?" For example, to get a project with its services and each service's latest deployment status:

```graphql
query project($id: String!) {
  project(id: $id) {
    name
    services {
      edges {
        node {
          name
          serviceInstances {
            edges {
              node {
                latestDeployment {
                  status
                }
              }
            }
          }
        }
      }
    }
  }
}
```

## Next steps

- **[API Cookbook](/integrations/api/api-cookbook):** Copy-paste examples for common operations
- **[Public API Reference](/integrations/api):** Authentication, rate limits, and more
