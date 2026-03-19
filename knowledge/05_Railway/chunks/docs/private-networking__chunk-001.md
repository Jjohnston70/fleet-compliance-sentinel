# Private Networking (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/private-networking.md
Original Path: docs/private-networking.md
Section: docs
Chunk: 1/3

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
