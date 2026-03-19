# Deploy a React App (Chunk 3/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/react.md
Original Path: guides/react.md
Section: guides
Chunk: 3/3

---

### Use a Dockerfile

1. Create a `Dockerfile` in the `helloworld` or React app's root directory.
2. Add the content below to the `Dockerfile`:

   ```bash
   # Use the Node alpine official image
   # https://hub.docker.com/_/node
   FROM node:lts-alpine AS build

   # Set config
   ENV NPM_CONFIG_UPDATE_NOTIFIER=false
   ENV NPM_CONFIG_FUND=false

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

   # Use the Caddy image
   FROM caddy

   # Create and change to the app directory.
   WORKDIR /app

   # Copy Caddyfile to the container image.
   COPY Caddyfile ./

   # Copy local code to the container image.
   RUN caddy fmt Caddyfile --overwrite

   # Copy files to the container image.
   COPY --from=build /app/dist ./dist

   # Use Caddy to run/serve the app
   CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]
   ```

   The `Dockerfile` will use Caddy to serve the React app.

3. Add a `Caddyfile` to the app's root directory:

   ```bash
   # global options
   {
       admin off # there's no need for the admin api in railway's environment
       persist_config off # storage isn't persistent anyway
       auto_https off # railway handles https for us, this would cause issues if left enabled
       # runtime logs
       log {
           format json # set runtime log format to json mode
       }
       # server options
       servers {
           trusted_proxies static private_ranges 100.0.0.0/8 # trust railway's proxy
       }
   }

   # site block, listens on the $PORT environment variable, automatically assigned by railway
   :{$PORT:3000} {
       # access logs
       log {
           format json # set access log format to json mode
       }

       # health check for railway
       rewrite /health /*

       # serve from the 'dist' folder (Vite builds into the 'dist' folder)
       root * dist

       # enable gzipping responses
       encode gzip

       # serve files from 'dist'
       file_server

       # if path doesn't exist, redirect it to 'index.html' for client side routing
       try_files {path} /index.html
   }
   ```

4. Either deploy via the CLI or from GitHub.

Railway automatically detects the `Dockerfile`, [and uses it to build and deploy the app.](/builds/dockerfiles)

**Note:** Railway supports also [deployment from public and private Docker images](/guides/services#deploying-a-public-docker-image).

This guide covers the main deployment options on Railway. Choose the approach that suits your setup, and start deploying your React apps seamlessly!

## Next steps

Explore these resources to learn how you can maximize your experience with Railway:

- [Add a Database Service](/databases/build-a-database-service)
- [Monitor your app](/observability)
