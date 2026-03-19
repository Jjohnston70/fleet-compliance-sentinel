# Deploy a Ruby on Rails App (Chunk 5/7)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/rails.md
Original Path: guides/rails.md
Section: guides
Chunk: 5/7

---

## Setting up tailwindcss

[TailwindCSS](https://tailwindcss.com/docs/) is a utility-first CSS framework that ships with the latest version of Rails. It eliminates the need to write custom CSS from scratch.

You can add TailwindCSS to your Rails app in two ways:

1. **During app creation**: Add the `--css tailwind` flag when creating a new Rails app:
   ```bash
   rails new myapp --css tailwind
   ```

2. **To an existing app**: Add the `tailwindcss-rails` gem to your `Gemfile` and run the installer:
   ```bash
   bundle add tailwindcss-rails
   bin/rails tailwindcss:install
   ```

### Running tailwindcss in development

During development, you need the TailwindCSS watcher to automatically compile your styles as you make changes.

You can run it in two ways:

**Option 1**: As a standalone process alongside your Rails server:
```bash
bin/rails tailwindcss:watch
```

**Option 2**: Integrated with Puma by adding this to your `config/puma.rb` file:
```ruby
plugin :tailwindcss
```

This automatically starts the watcher when you run `bin/rails server`.

### Fixing tailwindcss in production

When deploying to Railway, you may encounter this error:

```
sh: 1: watchman: not found
Bun v1.2.20 (Linux x64 baseline)
    path: "/rails/app/assets/builds/tailwind.css",
    code: "EACCES"
 syscall: "open",
   errno: -13,
```

This happens because the compiled CSS file isn't available in production. The TailwindCSS watcher can't run during deployment due to file permission restrictions.

**The solution**: Precompile your assets before deployment.

Choose one of these two approaches:

**Option 1: Precompile in Dockerfile**

Add this line to your `Dockerfile` before the final `FROM base` stage (usually after building dependencies but before copying to the final image):

```dockerfile
RUN SECRET_KEY_BASE_DUMMY=1 ./bin/rails assets:precompile
```

This compiles your TailwindCSS during the Docker build process.

**Option 2: Precompile via railway.json**

Add a `preDeployCommand` to your `railway.json` file:

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "deploy": {
    "preDeployCommand": "bundle exec rails db:prepare && bundle exec rails assets:precompile"
  }
}
```

This runs asset compilation automatically before each deployment.

**Recommendation**: Option 1 (Dockerfile) is generally preferred because it includes compiled assets in your Docker image, making deployments faster and more reliable.

## Setting up solidqueue

[SolidQueue](https://github.com/rails/solid_queue) is a database-backed queuing backend for Active Job. Unlike Sidekiq,
it doesn't require Redis or any additional infrastructure beyond your existing database.
This makes it an excellent choice for simplifying your deployment architecture.
For complete installation instructions, refer to the [official SolidQueue documentation](https://github.com/rails/solid_queue?tab=readme-ov-file#installation).

### Deployment options

SolidQueue can be configured in three different ways on Railway:
