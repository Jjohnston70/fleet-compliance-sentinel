# Deploy a Ruby on Rails App (Chunk 4/7)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/rails.md
Original Path: guides/rails.md
Section: guides
Chunk: 4/7

---

## Set up workers & cron jobs with sidekiq

Sidekiq is a powerful and efficient background job processor for Ruby apps, and it integrates seamlessly with Rails. Follow the instructions below to configure and run Sidekiq in your Rails app on Railway:

1. **Install Sidekiq**
   - Start by adding `sidekiq` and `sidekiq-cron` to your Rails app. In your terminal, run the following command:
     ```bash
     bundle add sidekiq
     bundle add sidekiq-cron
     ```
2. **Add a Redis Database Service**
   - Sidekiq uses Redis as a job queue. To set this up:
     - Right-click on the Railway project canvas or click the **Create** button.
     - Select **Database**.
     - Select **Add Redis** from the available databases.
       - This will create and deploy a new Redis service for your app.
3. **Create and Configure a Worker Service**
   - Now, set up a [separate service](/guides/services#creating-a-service) to run your Sidekiq workers.
     - Create a new [**Empty Service**](/overview/the-basics#service-settings) and name it **Worker Service**.
     - Go to the [**Settings**](/overview/the-basics#service-settings) tab of this service to configure it.
     - In the **Source** section, connect your GitHub repository to the **Source Repo**.
     - Under the [**Build**](/guides/build-configuration#customize-the-build-command) section, set `bundle install` as the **Custom Build Command**. This installs the necessary dependencies.
     - In the **Deploy** section, set `bundle exec sidekiq` as the [**Custom Start Command**](/guides/start-command). This command will start Sidekiq and begin processing jobs.
     - Click on [**Variables**](/overview/the-basics#service-variables) at the top of the service settings.
     - Add the following environment variables:
       - `RAILS_ENV`: Set the value to `production`.
       - `SECRET_KEY_BASE` or `RAILS_MASTER_KEY`: Set this to the value of your Rails app’s secret key.
       - `REDIS_URL`: Set this to `${{Redis.REDIS_URL}}` to reference the Redis database URL. This tells Sidekiq where to find the job queue. Learn more about [referencing service variables](/variables#referencing-another-services-variable).
       - Include any other environment variables your app might need.
     - Click **Deploy** to apply the changes and start the deployment.
4. **Verify the Deployment**:

   - Once the deployment is complete, click on **View Logs**. If everything is set up correctly, you should see Sidekiq starting up and processing any queued jobs.

5. **Confirm All Services Are Connected**:
   - At this stage, your application should have the following services set up and connected:
     - **App Service**: Running the main Rails application.
     - **Worker Service**: Running Sidekiq to process background jobs.
     - **Postgres Service**: The database for your Rails app.
     - **Redis Service**: Used by Sidekiq to manage background jobs

Here’s how your setup should look:

By following these steps, you’ll have a fully functional Rails app with background job processing using Sidekiq on Railway. If you run into any issues or need to make adjustments, check the logs and revisit your environment variable configurations.
