# Deploy a Rust Axum App (Chunk 4/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/axum.md
Original Path: guides/axum.md
Section: guides
Chunk: 4/4

---

### Use a Dockerfile

1. Create a `Dockerfile` in the `helloworld` or Axum app's root directory.
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

This guide covers the main deployment options on Railway. Choose the approach that suits your setup, and start deploying your Axum apps seamlessly!

## Next steps

Explore these resources to learn how you can maximize your experience with Railway:

- [Add a Database Service](/databases/build-a-database-service)
- [Monitor your app](/observability)
