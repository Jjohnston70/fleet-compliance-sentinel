# Add a CDN using Amazon CloudFront (Chunk 2/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/add-a-cdn-using-cloudfront.md
Original Path: guides/add-a-cdn-using-cloudfront.md
Section: guides
Chunk: 2/6

---

## 1. Create and deploy a Fastify server

First, create and deploy a simple Fastify server using the [Railway CLI](/cli#installing-the-cli)

- On your local machine, create a folder called "fastify"
- Inside of the folder, create a file called "server.js"
- Run the following commands to initialize the project and install the required packages using npm
  ```plaintext
  npm init -y
  npm i fastify @fastify/etag
  ```
- Add the following code to the "server.js" file

  ```javascript
  const Fastify = require("fastify");
  const fastifyEtag = require("@fastify/etag");

  const fastify = Fastify();
  fastify.register(fastifyEtag);

  fastify.get("/dynamic", async (request, reply) => {
    console.log("Received request on dynamic route");

    const staticContent = {
      message: "This is some dynamic content",
      timestamp: new Date().toISOString(),
    };

    reply.type("application/json");
    reply.headers({
      "cache-control": "must-revalidate, max-age=60",
    });

    reply.send(staticContent);
  });

  fastify.get("/static", async (request, reply) => {
    console.log("Received request on static route");

    const staticContent = {
      message: "This is some static content",
    };

    reply.type("application/json");
    reply.headers({
      "cache-control": "must-revalidate, max-age=60",
    });

    reply.send(staticContent);
  });

  fastify.get("/staticEtag", async (request, reply) => {
    console.log("Received request on staticEtag route");

    const staticContent = {
      message: "This will serve a static etag",
    };

    reply.type("application/json");

    reply.headers({
      "cache-control": "must-revalidate, max-age=60",
    });

    reply.header("etag", '"foobar"');
    reply.send(staticContent);
  });

  const start = async () => {
    try {
      await fastify.listen({
        port: Number(process.env.PORT) || 3000,
        host: "0.0.0.0",
      });
      console.log(
        `Server is running at PORT:${Number(process.env.PORT) || 3000}`,
      );
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };

  start();
  ```

- Run the following command to initialize a new project in Railway
  ```plaintext
  railway init
  ```
- Follow the prompts and name your project "fastify-cdn"
- Run the following command to deploy your Fastify server
  ```plaintext
  railway up -d
  ```
- Run the following command to generate a domain for the Fastify service
  ```plaintext
  railway domain
  ```
- Run the following command to open your Railway project in your browser
  ```plaintext
  railway open
  ```

### Checkpoint

Nice! You now have a Fastify server running in Railway serving three routes, which will serve to demonstrate a few different concepts related to caching:

- `/static` - the static route serves a static message which never changes, unless the code is updated
- `/dynamic` - the dynamic route servers a dynamic message which changes when the route is accessed and the `Date()` function runs
- `/staticEtag` - the staticEtag route demonstrates how you can manually set an [HTTP Etag](https://www.rfc-editor.org/rfc/rfc9110.html#section-8.8.3) on a route

  _Note: The Fastify server code above implements [Fastify's eTag plugin](https://www.npmjs.com/package/@fastify/etag)._
