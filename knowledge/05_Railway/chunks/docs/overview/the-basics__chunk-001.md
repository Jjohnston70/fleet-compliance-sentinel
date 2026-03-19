# The Basics (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/overview/the-basics.md
Original Path: docs/overview/the-basics.md
Section: docs
Chunk: 1/2

---

# The Basics

Learn about the core concepts of Railway.

This document outlines the core concepts of Railway, providing foundational knowledge of the basic building blocks you'll work with in the platform.

## In a nutshell

- **[Dashboard](#dashboard--projects)** - Main entrypoint for all projects under your account.
- **[Project](#project--project-canvas)** - A collection of services under the same network.
  - **[Project Settings](#project-settings)** - Contains all project-level settings.
- **[Service](#services)** - A target for a deployment source (e.g. Web Application).
  - **[Service Variables](#service-variables)** - A collection of configurations and secrets.
  - **[Backups](#backups)** - A collection of backups for a service.
  - **[Service Metrics](#service-metrics)** - Rundown of metrics for a service.
  - **[Service Settings](#service-settings)** - Contains all service-level settings.
- **[Deployment](#deployments)** - Built and deliverable unit of a service.
- **[Volumes](#volumes)** - Persistent storage solution for services.
  - **[Volume Metrics](#volume-metrics)** - Rundown of metrics for volumes (e.g. disk usage over time).
  - **[Volume Settings](#volume-settings)** - Contains all volume-level settings.

## Dashboard / projects

Your main entrypoint to Railway where all your [projects](/overview/the-basics#project--project-canvas) are shown in the order they were last opened.

Projects contain your [services](/overview/the-basics#services) and [environments](/environments).

## Project / project canvas

A project represents a capsule for composing infrastructure in Railway. You can think of a project as an application stack, a service group, or even a collection of service groups.

Services within a project are automatically joined to a [private network](/networking/private-networking) scoped to that project.

### Project settings

This page contains all the project level settings.

Some of the most commonly used project settings are -

- [Transfer Project](/projects/workspaces#transferring-projects) - Transfer your project between workspaces.

- [Environments](/environments) - Manage various settings regarding environments.

- [Members](/projects/project-members) - Add or remove members to collaborate on your project.

- Danger - Remove individual [services](/overview/the-basics#services) or delete the entire project.

## Services

A Railway service is a deployment target for your deployment source. Deployment sources can be [code repositories](https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories) or [Docker Images](https://docs.docker.com/guides/docker-concepts/the-basics/what-is-an-image/). Once you create a service and choose a source, Railway will analyze the source, build a Docker image (if the source is a code repository), and deploy it to the service.

Out of the box, your service is deployed with a set of default configurations which can be overridden as needed.

### Service variables

Service [Variables](/variables) provide a powerful way to manage configuration and secrets across services in Railway.

You can configure variables scoped to services. These variables are specific to each service and are not shared across the project by default.

If you want to access variables from this service in another service within the same project, you need to utilize a [Reference Variable](/variables/reference#reference-variables).
