# Introduction to GraphQL (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/integrations/api/graphql-overview.md
Original Path: docs/integrations/api/graphql-overview.md
Section: docs
Chunk: 2/3

---

## Exploring the schema

The best way to discover what's available in Railway's API is through the [GraphiQL playground](https://railway.com/graphiql).

### Using the docs panel

Click the "Docs" button (or press Ctrl/Cmd+Shift+D) to open the documentation explorer. From here you can:

1. **Browse root operations:** Start with `Query` to see all available queries, or `Mutation` for all mutations
2. **Search for types:** Use the search box to find types like `Project`, `Service`, or `Deployment`
3. **Navigate relationships:** Click on any type to see its fields, then click on field types to explore further

### Understanding type signatures

GraphQL types follow consistent patterns:

```graphql
name: String          # Optional string (can be null)
name: String!         # Required string (cannot be null)

services: [Service!]! # Required list of required Service objects
```

The `!` means non-null. When you see `String!`, a value is guaranteed. When you see `String` without `!`, it might be null. For lists, `[Service!]!` means the list itself is required and every item in it is required.

When a field returns an object type like `Service`, you must specify which fields you want from it:

```graphql
services {      # services is [Service!]!
  id            # pick the fields you want
  name
}
```

Input types define what you pass to mutations:

```graphql
input ProjectCreateInput {
  name: String!       # Required field
  description: String # Optional field
}
```

### Finding available fields

Click on any type in GraphiQL's Docs panel to see its fields. For example, click `Project` to see `id`, `name`, `description`, `services`, `environments`, and more. For mutations, click the input type (like `ProjectCreateInput`) to see required and optional fields.

### Pro tip: use autocomplete

In GraphiQL's editor, press Ctrl+Space to trigger autocomplete. It shows all valid fields at your current position in the query, with descriptions.

## Pagination

Railway's API uses Relay-style pagination for lists. Instead of returning a flat array, lists are wrapped in `edges` and `node`:

```graphql
services {
  edges {
    node {
      id
      name
    }
  }
}
```

This structure enables cursor-based pagination for large datasets.

### Paginating through results

For larger lists, use `first` to limit results and `after` to fetch the next page:

```graphql
query deployments($input: DeploymentListInput!, $first: Int, $after: String) {
  deployments(input: $input, first: $first, after: $after) {
    edges {
      node {
        id
        status
        createdAt
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

The `pageInfo` object tells you:

- `hasNextPage`: whether more results exist
- `endCursor`: the cursor to pass as `after` to get the next page

## Making your first request

Railway's GraphQL endpoint is:

```
https://backboard.railway.com/graphql/v2
```

A GraphQL request is an HTTP POST with a JSON body containing your query. You can use Railway's [GraphiQL playground](https://railway.com/graphiql) to explore and test queries before writing code, or tools like [Apollo Studio](https://studio.apollographql.com/sandbox/explorer) or [Insomnia](https://insomnia.rest/).

### Using cURL

```bash
curl -X POST https://backboard.railway.com/graphql/v2 \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { me { name email } }"}'
```
