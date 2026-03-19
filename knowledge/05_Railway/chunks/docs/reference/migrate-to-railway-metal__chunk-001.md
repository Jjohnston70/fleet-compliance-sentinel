# Migrate to Railway Metal (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/reference/migrate-to-railway-metal.md
Original Path: docs/reference/migrate-to-railway-metal.md
Section: docs
Chunk: 1/3

---

# Migrate to Railway Metal

Learn how to move self-migrate your services over to Railway Metal

This page will describe in detail the migration process when a service moves to Railway Metal.

This guide covers: how to initiate a migration, how to best prepare for a migration, and what mechanically happens when you initiate a migration of your services to Railway Metal.

## What is Railway metal?

Railway Metal is the next generation of Railway's underlying infrastructure. It is built on hardware that we own and operate in datacenters around the world. You can get more information about Railway Metal on the parent [documentation page here.](/platform/railway-metal)

We announced on December 26th that we would be moving users to Railway Metal over a 6 month migration timeline.

**We expect all user workloads to be on Railway Metal by July 4th, 2025.**

Railway is **currently** initiating migrations of user workloads to Railway Metal regions at off-peak times per region.

As such, we advise Railway's customers to move all of their workloads to Railway Metal to avoid Railway initiated downtime.

## What does a migration to Railway metal entail?

A migration to Railway Metal is just like any deployment on Railway that would happen if you changed the region setting to a different value.

Railway is built region agnostically, meaning, the choice of region doesn't impact the availability of products or features depending on the region. In doing so, user workloads can be deployed into different geographic regions at will.

A migration to Railway Metal is a simple region change.

For Stateless deployments, meaning, a deployment with no volume- there is no downtime. Stateless deployments are just landing into a new region.

For services with a volume attached, or Stateful deployments, there is a brief 30-45 second period of downtime as the volume re-mounts into the new deployment. _This is exactly the same as the existing cross region deployment functionality that exists in Railway today._

## Initiating a migration

You can initiate a migration by selecting a region in the service settings pane with any label that has: `Metal (New)`

After you select the region, you will get the Staged Change anchored modal at the center top position of the project canvas.

By pressing: "Deploy", you initiate a migration to Railway Metal.
