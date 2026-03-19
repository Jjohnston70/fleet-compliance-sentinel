Title: Private Networking
Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/private-networking.md
Original Path: docs/private-networking.md
Section: docs

---

# Private Networking

Learn everything about private networking on Railway.

Private Networking is a feature within Railway that allows you to have a private network between your services, helpful for situations where you want to have a public gateway for your API but leave internal communication private.

## How it works

Under the hood, Railway uses encrypted Wireguard tunnels to create a private mesh network between all services within an environment. This allows traffic to route between services without exposing ports publicly.

By default, all projects have private networking enabled and services will get a DNS name under the `railway.internal` domain. For new environments (created after October 16, 2025), this DNS name will resolve to both internal IPv4 and IPv6 addresses. [Legacy environments](#legacy-environments) resolve to IPv6 only.

### Internal DNS

Every service in a project and environment gets an internal DNS name under the `railway.internal` domain that resolves to the internal IP addresses of the service.

This allows communication between services in an environment without exposing any ports publicly. Any valid IPv6 or IPv4 traffic is allowed, including UDP, TCP, and HTTP.

For more details on internal DNS names, see the [Domains guide](/networking/domains/working-with-domains#private-domains).

## Communicating over the private network

To communicate over the private network, there are some specific things to know to be successful.

[Railway now supports both IPv6 and IPv4 private networking in all newly created environments](https://railway.com/changelog/2025-10-17-repo-aware-settings#ipv4-private-networks). [Legacy environments](#legacy-environments) (created before October 16th 2025) will still be limited to IPv6. With that in mind, we've preserved the IPv6 only guides below.

However, if you've setup a new service or environment after IPv4 support is released you're good to use IPv4 or IPv6! whatever suits you best!

### Service configuration

We recommend configuring your application to listen on `::` (all interfaces). This ensures your app works in both new (IPv4/IPv6) and legacy (IPv6-only) environments.

Some examples are below -

#### Node / Express

Listen on `::` to bind to both IPv4 and IPv6.

```javascript
const port = process.env.PORT || 3000;

app.listen(port, "::", () => {
  console.log(`Server listening on [::]${port}`);
});
```

#### Node / Nest

Listen on `::` to bind to both IPv4 and IPv6.

```javascript
const port = process.env.PORT || 3000;

async function bootstrap() {
  await app.listen(port, "::");
}
```

#### Node / next

Update your start command to bind to both IPv4 and IPv6.

```bash
next start --hostname :: --port ${PORT-3000}
```

Or if you are using a custom server, set `hostname` to `::` in the configuration object passed to the `next()` function.

```javascript
const port = process.env.PORT || 3000;

const app = next({
  // ...
  hostname: "::",
  port: port,
});
```

If neither of these options are viable, you can set a `HOSTNAME` [service variable](/variables#service-variables) with the value `::` to listen on both IPv4 and IPv6.

#### Python / gunicorn

Update your start command to bind to both IPv4 and IPv6.

```bash
gunicorn app:app --bind [::]:${PORT-3000}
```

#### Python / hypercorn

Update your start command to bind to both IPv4 and IPv6.

```bash
hypercorn app:app --bind [::]:${PORT-3000}
```

#### Python / uvicorn

Update your start command to bind to both IPv4 and IPv6.

```bash
uvicorn app:app --host "" --port ${PORT-3000}
```

#### Rust / Axum

Listen on `[::]` to bind to both IPv4 and IPv6.

```rust
let app = Router::new().route("/", get(health));

let listener = tokio::net::TcpListener::bind("[::]:8080").await.unwrap();

axum::serve(listener, app).await;
```

### Use internal hostname and port

For applications making requests to a service over the private network, you should use the internal DNS name of the service, plus the `PORT` on which the service is listening.

For example, if you have a service called `api` listening on port 3000, and you want to communicate with it from another service, you would use `api.railway.internal` as the hostname and specify the port -

```javascript
app.get("/fetch-secret", async (req, res) => {
  axios.get("http://api.railway.internal:3000/secret").then(response => {
    res.json(response.data);
  });
});
```

Note that you should use `http` in the address.

#### Using reference variables

Using [reference variables](/variables#reference-variables), you can accomplish the same end as the above example.

Let's say you are setting up your frontend service to talk to the `api` service. In the frontend service, set the following variable -

```
BACKEND_URL=http://${{api.RAILWAY_PRIVATE_DOMAIN}}:${{api.PORT}}
```

`api.PORT` above refers to a service variable that must be set manually. It does not automatically resolve to the port the service is listening on, nor does it resolve to the `PORT` environment variable injected into the service at runtime.

Then in the frontend code, you will simply reference the `BACKEND_URL` environment variable -

```javascript
app.get("/fetch-secret", async (req, res) => {
  axios.get(`${process.env.BACKEND_URL}/secret`).then(response => {
    res.json(response.data);
  });
});
```

### Private network context

The private network exists in the context of a project and environment and is not accessible over the public internet. In other words -

- A web application that makes client-side requests **cannot** communicate to another service over the private network.
- Services in one project/environment **cannot** communicate with services in another project/environment over the private network.

Check out the [FAQ](#faq) section for more information.

### Library-specific configuration

Some libraries and components require explicit configuration for dual-stack (IPv4/IPv6) networking or to work properly in legacy IPv6-only environments.

See the [Library Configuration guide](/networking/private-networking/library-configuration) for detailed setup instructions for:
- **Node.js**: ioredis, bullmq, hot-shots
- **Go**: Fiber
- **Docker**: MongoDB

## Changing the service name for DNS

Within the service settings you can change the service name to which you refer, e.g. `api-1.railway.internal` -> `api-2.railway.internal`

The root of the domain, `railway.internal`, is static and **cannot** be changed.

## Caveats

During the feature development process we found a few caveats that you should be aware of:

- Private networking is not available during the build phase.
- Private networking does not function between [environments](/environments).
- [Legacy environments](#legacy-environments) (created before October 16, 2025) only support IPv6. New environments support both IPv4 and IPv6.

## Legacy environments

Environments created before October 16th, 2025 are considered legacy environments and only support IPv6 addressing for private networking.

If you want to utilize private networking in a legacy environment, you will need to configure your service to bind to `::` (the IPv6 all-interfaces address). See the [Service Configuration](#service-configuration) section for more information on configuring your listener. This will continue to work after your environment receives IPv4 support.

## FAQ

## Troubleshooting

Having issues with private networking? Check out the [Troubleshooting guide](/troubleshooting) or reach out on the [Railway Discord](https://discord.gg/railway).
