# API Cookbook (Chunk 1/1)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/integrations/api/api-cookbook.md
Original Path: docs/integrations/api/api-cookbook.md
Section: docs
Chunk: 1/1

---

# API Cookbook

Quick reference for common Railway API operations.

This cookbook provides quick copy-paste examples for common API operations. For detailed explanations, see the linked guides.

## Quick setup

**GraphQL Endpoint:**
```
https://backboard.railway.com/graphql/v2
```

**Authentication:**
```bash

# Set your token (get one from railway.com/account/tokens)
```

Test your connection:

---

## Projects

See [Manage Projects](/integrations/api/manage-projects) for more details.

### List all projects

### Get project with services

### Create a project

---

## Services

See [Manage Services](/integrations/api/manage-services) for more details.

### Create service from GitHub

### Create service from Docker image

### Update service settings

---

## Deployments

See [Manage Deployments](/integrations/api/manage-deployments) for more details.

### List recent deployments

### Get deployment logs

### Deploy

### Rollback

---

## Variables

See [Manage Variables](/integrations/api/manage-variables) for more details.

### Get variables

### Set variables

---

## Environments

### List environments

### Create environment

---

## Domains

### Add Railway domain

### Add custom domain

---

## Volumes

### Create volume

### Create backup

---

## TCP proxies

### List TCP proxies

---

## Workspaces

### Get workspace

---

## Useful queries

### Get project token info

Use with a project token:

### List available regions

---

## Tips

### Finding IDs

Press `Cmd/Ctrl + K` in the Railway dashboard and search for "Copy Project ID", "Copy Service ID", or "Copy Environment ID".

### Using the network tab

Do the action in the Railway dashboard and inspect the network tab to see the exact GraphQL queries used.

### GraphiQL playground

Test queries interactively at [railway.com/graphiql](https://railway.com/graphiql).
