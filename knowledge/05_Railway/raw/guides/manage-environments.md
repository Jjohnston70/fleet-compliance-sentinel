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
