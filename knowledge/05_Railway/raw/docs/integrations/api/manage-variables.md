# Manage Variables with the Public API

Learn how to manage environment variables via the public GraphQL API.

Here are examples to help you manage your environment variables using the Public API.

## Get variables

Fetch variables for a service in an environment:

**Response:**
```json
{
  "data": {
    "variables": {
      "DATABASE_URL": "postgres://...",
      "NODE_ENV": "production",
      "PORT": "3000"
    }
  }
}
```

Omit `serviceId` to get shared variables for an environment instead.

## Get unrendered variables

Get variables with references intact (not resolved):

This returns variables like `${{Postgres.DATABASE_URL}}` instead of the resolved value.

## Create or update a variable

Upsert a single variable:

Omit `serviceId` to create a shared variable instead.

## Upsert multiple variables

Update multiple variables at once:

Using `replace: true` will delete all variables not included in the `variables` object.

## Delete a variable

Delete a single variable:

## Get rendered variables for deployment

Get all variables as they would appear during a deployment (with all references resolved):

## Variable references

Railway supports referencing variables from other services using the syntax:

```
${{ServiceName.VARIABLE_NAME}}
```

For example, to reference a database URL from a Postgres service:

## Common patterns

### Copy variables between environments

1. Fetch variables from source environment
2. Upsert to target environment using `variableCollectionUpsert`

### Import from .env file

Parse your `.env` file and use `variableCollectionUpsert` to set all variables at once.

### Rotate secrets

Use `variableUpsert` with `skipDeploys: true` for all services, then trigger deployments manually when ready.
