# ENOTFOUND redis.railway.internal (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/databases/troubleshooting/enotfound-redis-railway-internal.md
Original Path: docs/databases/troubleshooting/enotfound-redis-railway-internal.md
Section: docs
Chunk: 2/2

---

### Redis database in a different project

Create a [new Redis database](/databases/redis) in the same [project](/overview/the-basics#project--project-canvas) as your application, and connect it to the Redis database using the private network as shown in the examples above.

Read about best pracices to get the most out of the platform [here](/overview/best-practices).

### Connecting to a Redis database locally

The easiest way to connect to a Redis database locally is to use the public network.

You can do this is by using the `REDIS_PUBLIC_URL` environment variable to connect to the Redis database.

```js

const redis = new Redis(process.env.REDIS_PUBLIC_URL);

const ping = await redis.ping();
```
