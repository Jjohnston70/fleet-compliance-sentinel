# Set up a Tailscale Subnet Router (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/set-up-a-tailscale-subnet-router.md
Original Path: guides/set-up-a-tailscale-subnet-router.md
Section: guides
Chunk: 1/3

---

# Set up a Tailscale Subnet Router

Learn how to access a private network on Railway by using a Tailscale Subnet Router.

## What is a subnet router?

> A subnet router is a device within your tailnet that you use as a gateway that advertises routes for other devices that you want to connect to your tailnet without installing the Tailscale client.

_Source: [Subnet routers](https://tailscale.com/kb/1019/subnets) Via Tailscale's Documentation_

In the context of Railway, The "other devices" are the services within a project.

## About this tutorial

This tutorial will help you connect to your database via the private network without you having to use public endpoints.

Since Railway doesn't currently offer a native way to access the [private network](/networking/private-networking) from your local environment, you can use a Tailscale Subnet Router to accomplish this.

Deploying Tailscale as a subnet router into your project means that you can access the `railway.internal` private domains from any device connected to your tailnet.

This tutorial aims to provide a simple step-by-step guide on setting up everything needed so that you can access the private domains of your services.

**Objectives**

In this tutorial, you'll learn how to do the following: -

- Generate an Auth Key.
- Set up split DNS.
- Deploy the Tailscale Subnet Router template.
- Approve the private network subnet.
- (Bonus) Connect to Postgres locally via the private domain.

**Prerequisites**

This guide assumes you are familiar with the concepts of Private Network, for a quick explainer check out the [guide](/networking/private-networking) and [reference](/networking/private-networking) page.

**In Railway -**

- Have all the services you plan on connecting to via the tailnet, listening on `::` (all interfaces).

  This is necessary because the Tailscale tunnel will communicate with your services over Railway's private network.

  All database services already do this but for information on configuring your service to listen on `::`, see [here](/networking/private-networking#service-configuration).

**In Tailscale -**

- Have an account.

  You can sign up [here](https://login.tailscale.com/start) - For what this template achieves you do not need a paid plan.

- Have the Tailscale app installed on your computer.

  You can find the downloads for your OS [here](https://tailscale.com/download).

## 1. Getting an auth key

The Auth key will authenticate the Tailscale machine that you'll deploy into your Railway project in a later step.

- Head over to the [Keys](https://login.tailscale.com/admin/settings/keys) page located within the settings menu on the Tailscale dashboard.

- Click **Generate auth key**.

  Put in a description and leave all other settings as the default.

- Click **Generate key**.

  Tailscale will now show you the newly generated auth key, **be sure to copy it down**.

- Click **Done**.
