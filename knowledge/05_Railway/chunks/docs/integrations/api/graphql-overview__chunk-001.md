# Introduction to GraphQL (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/integrations/api/graphql-overview.md
Original Path: docs/integrations/api/graphql-overview.md
Section: docs
Chunk: 1/3

---

# Introduction to GraphQL

Learn what GraphQL is, why Railway uses it, and how to get started.

If you've worked with REST APIs, GraphQL might feel unfamiliar at first. This guide explains what GraphQL is, why it exists, and how to start using Railway's API.

## What is GraphQL?

GraphQL is a query language for APIs. Instead of hitting different endpoints to get different pieces of data, you write a query that describes exactly what you want. The server returns nothing more, nothing less.

Here's a simple example. Say you want to fetch a project's name and the names of its services:

```graphql
query project($id: String!) {
  project(id: $id) {
    name
    services {
      edges {
        node {
          name
        }
      }
    }
  }
}
```

Variables:

```json
{
  "id": "your-project-id"
}
```

The response mirrors the shape of your query:

```json
{
  "data": {
    "project": {
      "name": "my-app",
      "services": {
        "edges": [
          { "node": { "name": "api" } },
          { "node": { "name": "postgres" } }
        ]
      }
    }
  }
}
```

If you also wanted `createdAt`, you'd add it to your query. If you don't need something, leave it out.

## How is this different from REST?

With a REST API, you typically have multiple endpoints that return fixed data structures:

```
GET /projects/123           → returns project details
GET /projects/123/services  → returns list of services
GET /services/456           → returns one service's details
```

To get a project with its services, you might need multiple requests, then stitch the data together yourself. Each endpoint returns whatever fields the API designer decided to include.

GraphQL inverts this. There's one endpoint, and you decide what data you need by writing a query.

| REST | GraphQL |
| --- | --- |
| Multiple endpoints | Single endpoint |
| Server decides response shape | Client decides response shape |
| Often requires multiple round-trips | Fetch related data in one request |
| Fixed response structure | Flexible response structure |

## Why does Railway use GraphQL?

**Evolve without versioning.** Adding new fields doesn't break existing queries. Clients only get what they ask for, so new fields are invisible to old clients. No `/v1/`, `/v2/` versioning needed.

**Strongly typed.** Every GraphQL API has a schema that defines valid queries. This means better tooling, auto-generated documentation, and errors caught before runtime.

**Self-documenting.** The schema is always available to explore, which this guide covers below.

## Core concepts

### Queries

Queries read data. They're the GraphQL equivalent of GET requests.

```graphql
query {
  me {
    id
    name
    email
  }
}
```

### Mutations

Mutations change data. They're the equivalent of POST, PUT, or DELETE.

```graphql
mutation projectCreate($input: ProjectCreateInput!) {
  projectCreate(input: $input) {
    id
    name
  }
}
```

Variables:

```json
{
  "input": {
    "name": "my-new-project"
  }
}
```

Notice that mutations also return data. You can ask for fields on the newly created resource in the same request.

### Variables

The mutation example above uses `$input`. Variables are passed separately from the query as JSON. This keeps queries reusable and makes it easier to work with dynamic values.

### The schema

Every GraphQL API is backed by a schema that defines all available types, queries, and mutations. The schema is what makes autocomplete and validation possible.
