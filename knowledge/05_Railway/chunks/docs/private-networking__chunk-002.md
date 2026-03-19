# Private Networking (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/private-networking.md
Original Path: docs/private-networking.md
Section: docs
Chunk: 2/3

---

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
