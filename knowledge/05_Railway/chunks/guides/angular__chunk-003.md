# Deploy an Angular App (Chunk 3/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/angular.md
Original Path: guides/angular.md
Section: guides
Chunk: 3/3

---

### Use a Dockerfile

1. Create a `Dockerfile` in the `gratitudeapp` or Angular app's root directory.
2. Add the content below to the `Dockerfile`:

   ```dockerfile
   # Use the Node alpine official image
   # https://hub.docker.com/_/node
   FROM node:lts-alpine

   # Create and change to the app directory.
   WORKDIR /app

   # Copy the files to the container image
   COPY package*.json ./

   # Install packages
   RUN npm ci

   # Copy local code to the container image.
   COPY . ./

   # Build the app.
   RUN npm run build

   # Serve the app
   CMD ["npm", "run", "start"]
   ```

3. Either deploy via the CLI or from GitHub.

Railway automatically detects the `Dockerfile`, [and uses it to build and deploy the app.](/builds/dockerfiles)

**Note:** Railway supports also [deployment from public and private Docker images](/guides/services#deploying-a-public-docker-image).

This guide covers the main deployment options on Railway. Choose the approach that suits your setup, and start deploying your Angular apps seamlessly!

## Next steps

Explore these resources to learn how you can maximize your experience with Railway:

- [Add a Database Service](/databases/build-a-database-service)
- [Monitor your app](/observability)
