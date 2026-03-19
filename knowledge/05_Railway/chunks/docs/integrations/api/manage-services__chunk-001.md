# Manage Services with the Public API (Chunk 1/1)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/integrations/api/manage-services.md
Original Path: docs/integrations/api/manage-services.md
Section: docs
Chunk: 1/1

---

# Manage Services with the Public API

Learn how to create and manage services via the public GraphQL API.

Here are examples to help you manage your services using the Public API.

## Get a service

Fetch a service by ID:

## Get a service instance

Get detailed service configuration for a specific environment:

## Create a service

### From a GitHub repository

### From a Docker image

### Empty service (no source)

Create an empty service that you can configure later:

## Update a service

Update service name or icon:

## Update service instance settings

Update build/deploy settings for a service in a specific environment. Click "Additional options" to see all available settings:

## Connect a service to a repo

Connect an existing service to a GitHub repository:

## Disconnect a service from a repo

## Deploy a service

Trigger a new deployment for a service:

This returns the deployment ID.

## Redeploy a service

Redeploy the latest deployment:

## Get resource limits

Get the resource limits for a service instance (returns a JSON object):

## Delete a service

This will delete the service and all its deployments.
