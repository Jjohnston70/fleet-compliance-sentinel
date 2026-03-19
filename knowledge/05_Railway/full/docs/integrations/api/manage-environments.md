Title: Manage Environments with the Public API
Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/integrations/api/manage-environments.md
Original Path: docs/integrations/api/manage-environments.md
Section: docs

---

# Manage Environments with the Public API

Learn how to manage environments via the public GraphQL API.

Here are examples to help you manage your environments using the Public API.

## List environments

Get all environments for a project:

### Exclude ephemeral environments

Filter out PR/preview environments:

## Get a single environment

Fetch an environment by ID with its service instances:

## Create an environment

Create a new environment:

## Rename an environment

## Delete an environment

This will delete the environment and all its deployments.

## Get environment logs

Fetch logs from all services in an environment:

## Staged changes

Railway supports staging variable changes before deploying them.

### Get staged changes

### Commit staged changes
