# Deploy a Ruby on Rails App (Chunk 7/7)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/rails.md
Original Path: guides/rails.md
Section: guides
Chunk: 7/7

---

### Example configuration

You can still use `railway.json` for shared settings like build configuration and pre-deploy commands.
Here's a recommended configuration that works across multiple services:

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "preDeployCommand": "bundle exec rails db:prepare"
  }
}
```

**What this does:**

- `build`: Tells Railway to use your Dockerfile for all services
- `preDeployCommand`: Runs database migrations before deployment (useful for both web and worker services)
- No `startCommand`: Allows each service to define its own start command

**Service-specific start commands** (set in Railway dashboard):

- **Web Service**: `bin/rails server -b ::`
- **Worker Service (Sidekiq)**: `bundle exec sidekiq`
- **Worker Service (SolidQueue)**: `bin/jobs`

This setup gives you the flexibility to run different processes from the same codebase while sharing common configuration.

Explore these resources to learn how you can maximize your experience with Railway:

- [Monitoring](/observability)
- [Deployments](/deployments)
