Title: Library Configuration
Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/networking/private-networking/library-configuration.md
Original Path: docs/networking/private-networking/library-configuration.md
Section: docs

---

# Library Configuration

Configure libraries and frameworks for Railway's private networking.

Some libraries and components require explicit configuration for dual-stack (IPv4/IPv6) networking or to work properly in [legacy IPv6-only environments](/networking/private-networking#legacy-environments).

## Node.js libraries

### ioredis

`ioredis` is a Redis client for node.js, commonly used for connecting to Redis from a node application.

When initializing a Redis client using `ioredis`, you must specify `family=0` in the connection string to support connecting to both IPv6 and IPv4 endpoints:

```javascript

const redis = new Redis(process.env.REDIS_URL + "?family=0");

const ping = await redis.ping();
```

[ioredis docs](https://www.npmjs.com/package/ioredis)

### bullmq

`bullmq` is a message queue and batch processing library for node.js, commonly used for processing jobs in a queue.

When initializing a bullmq client, you must specify `family: 0` in the connection object to support connecting to both IPv6 and IPv4 Redis endpoints:

```javascript

const redisURL = new URL(process.env.REDIS_URL);

const queue = new Queue("Queue", {
  connection: {
    family: 0,
    host: redisURL.hostname,
    port: redisURL.port,
    username: redisURL.username,
    password: redisURL.password,
  },
});

const jobs = await queue.getJobs();

console.log(jobs);
```

[bullmq docs](https://docs.bullmq.io/)

### Hot-shots

`hot-shots` is a StatsD client for node.js, which can be used to ship metrics to a DataDog agent for example. When initializing a StatsD client using `hot-shots`, you must specify that it should connect over IPv6:

```javascript
const StatsD = require("hot-shots");

const statsdClient = new StatsD({
  host: process.env.AGENT_HOST,
  port: process.env.AGENT_PORT,
  protocol: "udp",
  cacheDns: true,
  udpSocketOptions: {
    type: "udp6",
    reuseAddr: true,
    ipv6Only: true,
  },
});
```

[hot-shots docs](https://www.npmjs.com/package/hot-shots)

## Go libraries

### Fiber

`fiber` is a web framework for Go. When configuring your Fiber app, you should set the Network field to `tcp` to have it listen on IPv6 as well as IPv4:

```go
app := fiber.New(fiber.Config{
    Network:       "tcp",
    ServerHeader:  "Fiber",
    AppName: "Test App v1.0.1",
})
```

[Fiber docs](https://docs.gofiber.io/api/fiber#:~:text=json.Marshal-,Network,-string)

## Docker images

### MongoDB

If you are creating a service using the official Mongo Docker image from Docker Hub and would like to connect to it over the private network, you must start the container with options to instruct the Mongo instance to listen on IPv6. Set this in your [Start Command](/deployments/start-command):

```bash
docker-entrypoint.sh mongod --ipv6 --bind_ip ::,0.0.0.0
```

**Note:** The official MongoDB template provided by Railway is already deployed with this Start Command.

## Adding more libraries

If you encounter a library that requires specific configuration for Railway's private networking, please let us know on the [Railway Discord](https://discord.gg/railway) or submit a PR to the documentation.
