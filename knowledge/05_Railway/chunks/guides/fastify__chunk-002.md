# Deploy a Fastify App (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/fastify.md
Original Path: guides/fastify.md
Section: guides
Chunk: 2/2

---

## Use a Dockerfile

1. Clone the forked `fastify` repo and `cd` into the directory.
   - You can skip this step if you already have an app directory or repo on your machine that you want to deploy.
2. Create a `Dockerfile` in the `fastify` or app's root directory.
3. Add the content below to the `Dockerfile`:

   ```bash
   # Use the Node.js 18 alpine official image
   # https://hub.docker.com/_/node
   FROM node:18-alpine

   # Create and change to the app directory.
   WORKDIR /app

   # Copy local code to the container image.
   COPY . .

   # Install project dependencies
   RUN npm ci

   # Run the web service on container startup.
   CMD ["npm", "start"]
   ```

4. Either deploy via the CLI or from GitHub.

Railway automatically detects the `Dockerfile`, [and uses it to build and deploy the app.](/builds/dockerfiles)

**Note:** Railway supports also [deployment from public and private Docker images](/guides/services#deploying-a-public-docker-image).

## Next steps

Explore these resources to learn how you can maximize your experience with Railway:

- [Add a CDN using Amazon CloudFront to your Fastify app](/guides/add-a-cdn-using-cloudfront)
- [Add a Database Service](/databases/build-a-database-service)
- [Monitor your app](/observability)
