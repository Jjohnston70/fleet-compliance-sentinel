# Edge Networking (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/networking/edge-networking.md
Original Path: docs/networking/edge-networking.md
Section: docs
Chunk: 1/3

---

# Edge Networking

Learn how Railway's global edge network routes traffic to your deployments

Railway uses a globally distributed edge network to route traffic to your deployments. This guide explains how the edge network works, what the `X-Railway-Edge` header tells you, and why traffic sometimes appears to hit a different region than where your service is deployed.

## Edge network architecture

### How anycast works

Railway's edge network uses [anycast](https://en.wikipedia.org/wiki/Anycast) routing. With anycast, the same IP address is advertised from multiple geographic locations. When a user makes a request to your Railway service:

1. Their DNS query resolves to Railway's anycast IP addresses
2. Internet routing (BGP) automatically directs the request to the **nearest edge location** based on network topology
3. The edge proxy terminates TLS, processes the request, and forwards it to your deployment

The key insight is that **"nearest" is determined by network topology, not geographic distance**. A user in one city might be routed to an edge location in a different region if that path has better network connectivity.

### Edge regions VS deployment regions

Railway operates in four locations: **US West**, **US East**, **Europe West**, and **Asia Southeast**. Each location can serve as both an entry point for traffic (edge region) and a deployment target for your applications (deployment region).

You choose which locations to deploy your app to, but all edge regions are available automatically. Your users always enter Railway at the location nearest to them, regardless of where your app is deployed.

For any given request, traffic enters at the nearest edge region, then routes internally to the nearest deployment region where your app is running. If your app is deployed in multiple locations, traffic is routed to the closest one. If your app is only in one location, traffic routes there regardless of where it entered.

### Request flow

When a request reaches your Railway service, it follows this path:

```
User → ISP → Internet (BGP) → Nearest Edge
  → Internal Routing → Deployment Region → Your Service
```

1. **User to Edge**: Anycast routing directs traffic to the nearest edge location
2. **Edge Processing**: The edge proxy (tcp-proxy) terminates TLS, adds headers, and looks up routing information
3. **Internal Routing**: Traffic is forwarded over Railway's internal network to your deployment
4. **Service Response**: Your service processes the request and the response follows the reverse path

## Understanding the x-Railway-edge header

Every HTTP request to your Railway service includes the `X-Railway-Edge` header, which identifies which edge location handled the request.

### Header format

The header value follows the format: `railway/{region-identifier}`

| Header | Region | Location |
| ------ | ------ | -------- |
| `railway/us-west2` | US West | California, USA |
| `railway/us-east4-eqdc4a` | US East | Virginia, USA |
| `railway/europe-west4-drams3a` | Europe West | Amsterdam, Netherlands |
| `railway/asia-southeast1-eqsg3a` | Southeast Asia | Singapore |

### What it tells you

The `X-Railway-Edge` header indicates:
- Which edge location received and processed the incoming request
- The geographic region where TLS was terminated
- The entry point into Railway's network for that specific request
