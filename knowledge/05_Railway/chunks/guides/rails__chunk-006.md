# Deploy a Ruby on Rails App (Chunk 6/7)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/rails.md
Original Path: guides/rails.md
Section: guides
Chunk: 6/7

---

#### Option 1: separate database (recommended for high volume)

Use a dedicated PostgreSQL database for SolidQueue jobs. This isolates job processing from your application data.

Setup steps:
1. Create a new service for SolidQueue (similar to the Sidekiq worker service)
2. Add a separate PostgreSQL database service
3. Connect the SolidQueue service to this database
4. Set the database URL in your SolidQueue service environment variables

This approach is identical to the [Sidekiq setup](#set-up-workers--cron-jobs-with-sidekiq), but you'll use `bin/jobs` instead of `bundle exec sidekiq` as your start command.

#### Option 2: single database mode (recommended for most apps)

Share your existing PostgreSQL database between your main app and SolidQueue. This is simpler and works well for most applications.

Setup steps:
1. Follow the [single database configuration guide](https://github.com/rails/solid_queue?tab=readme-ov-file#single-database-configuration)
2. Create a new empty service in your Railway project
3. Connect it to the same PostgreSQL database your main app uses
4. Set the start command to `bin/jobs`

**Note**: To use the `bin/jobs` command with a shared `railway.json` configuration file, see the [Using the same railway.json for multiple services](#using-the-same-railway-json-for-multiple-services) section.

#### Option 3: run within puma (simplest setup)

Run SolidQueue in the same process as your main Rails application. This is the simplest option and requires no additional services.

Add this line to your `config/puma.rb` file:

```ruby
plugin :solid_queue
```

This starts SolidQueue automatically when Puma boots, similar to the TailwindCSS plugin.

**Trade-off**: While this is the easiest setup, running jobs in the same process as your web server can impact request performance under heavy job loads.
For production apps with significant background processing, consider using a separate service (Options 1 or 2).

## Using the same railway.json for multiple services

When running multiple services from the same repository (e.g., a web server and a worker service), you may encounter conflicts with the `startCommand` setting in `railway.json`.

### The problem

If your `railway.json` specifies a start command like `bundle exec rails server`, every service will try to use that command.
This prevents worker services from running their own commands like `bundle exec sidekiq` or `bin/jobs`.

### The solution

Remove the `startCommand` from your `railway.json` file and configure it individually for each service instead.

**Steps:**

1. Remove any `startCommand` entries from your `railway.json` file
2. For each service, manually set the start command in the Railway dashboard:
  - Go to the service's **Settings** tab
  - Navigate to the **Deploy** section
  - Set the **Custom Start Command**

This approach is explained in detail in step 3 of [Set Up Workers & Cron Jobs with Sidekiq](#set-up-workers--cron-jobs-with-sidekiq).
