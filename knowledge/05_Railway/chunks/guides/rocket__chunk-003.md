# Deploy a Rust Rocket App (Chunk 3/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/rocket.md
Original Path: guides/rocket.md
Section: guides
Chunk: 3/3

---

### Deploy from a GitHub repo

To deploy a Rocket app to Railway directly from GitHub, follow the steps below:

1. **Create a New Project on Railway**:
   - Go to [Railway](https://railway.com/new) to create a new project.
2. **Deploy from GitHub**:
   - Select **Deploy from GitHub repo** and choose your repository.
     - If your Railway account isn’t linked to GitHub yet, you’ll be prompted to do so.
3. **Add Environment Variables**:
   - Click **Add Variables**, then add `ROCKET_ADDRESS` with the value `0.0.0.0`. This allows your Rocket app to accept external connections by listening on `0.0.0.0`.
4. **Deploy the App**:
   - Click **Deploy** to start the deployment process.
   - Once the deployed, a Railway [service](/services) will be created for your app, but it won’t be publicly accessible by default.
5. **Verify the Deployment**:

   - Once the deployment completes, go to **View logs** to check if the server is running successfully.

   **Note:** During the deployment process, Railway will automatically [detect that it’s a Rust app](https://nixpacks.com/docs/providers/rust).

6. **Set Up a Public URL**:
   - Navigate to the **Networking** section under the [Settings](/overview/the-basics#service-settings) tab of your new service.
   - Click [Generate Domain](/networking/public-networking#railway-provided-domain) to create a public URL for your app.

### Use a Dockerfile

1. Create a `Dockerfile` in the `helloworld` or Rocket app's root directory.
2. Add the content below to the `Dockerfile`:

   ```docker
   FROM lukemathwalker/cargo-chef:latest-rust-1 AS chef

   # Create and change to the app directory.
   WORKDIR /app

   FROM chef AS planner
   COPY . ./
   RUN cargo chef prepare --recipe-path recipe.json

   FROM chef AS builder
   COPY --from=planner /app/recipe.json recipe.json

   # Build dependencies - this is the caching Docker layer!
   RUN cargo chef cook --release --recipe-path recipe.json

   # Build application
   COPY . ./
   RUN cargo build --release

   CMD ["./target/release/helloworld"]
   ```

3. Either deploy via the CLI or from GitHub.

Railway automatically detects the `Dockerfile`, [and uses it to build and deploy the app.](/builds/dockerfiles)

**Note:** Railway supports also [deployment from public and private Docker images](/guides/services#deploying-a-public-docker-image).

This guide covers the main deployment options on Railway. Choose the approach that suits your setup, and start deploying your Rocket apps seamlessly!

## Next steps

Explore these resources to learn how you can maximize your experience with Railway:

- [Add a Database Service](/databases/build-a-database-service)
- [Monitor your app](/observability)
