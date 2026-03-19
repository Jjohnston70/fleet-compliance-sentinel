# Deploy a Django App (Chunk 5/7)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/django.md
Original Path: guides/django.md
Section: guides
Chunk: 5/7

---

## Set up database, migrations, celery beat and celery

This setup deploys your Django app on Railway, ensuring that your database, scheduled tasks (crons)--Celery Beat, and queue workers (Celery) are all fully operational.

The deployment structure follows a "majestic monolith" architecture, where the entire Django app is managed as a single codebase but split into four separate services on Railway:

- **App Service**: Handles HTTP requests and user interactions.
- **Cron Service**: Manages scheduled tasks (e.g., sending emails or running reports) using Celery Beat.
- **Worker Service**: Processes background jobs from the queue using Celery.
- **Database Service**: Stores and retrieves your application's data.

_My Monolith Django app_

**Note:** This guide follows the assumption that you have installed Celery and Celery Beat in your app, the broker uses Redis and you already have a Postgres database service provisioned for your app as shown earlier.

Please follow these steps to get it setup on Railway:
