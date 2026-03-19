# Deploy a Django App (Chunk 7/7)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/django.md
Original Path: guides/django.md
Section: guides
Chunk: 7/7

---

nd resources it consumes.
   - Head back to the top of the service and click on [**Variables**](/overview/the-basics#service-variables).
   - Add all the necessary environment variables especially those highlighted already in step 2.
   - Click **Deploy**.

At this point, you should have all services deployed and connected to the Postgres and Redis Database service:

- **Cron Service**: This service should run Celery Beat Scheduler to manage scheduled tasks.

- **Worker Service**: This service should be running Celery and ready to process jobs from the queue.

- **App Service**: This service should be running and is the only one that should have a public domain, allowing users to access your application.

**Note:** There is a [community template](https://railway.com/template/yZDfUu) available that demonstrates this deployment approach. You can easily deploy this template and then connect it to your own GitHub repository for your application.

## Next steps

Explore these resources to learn how you can maximize your experience with Railway:

- [Monitoring](/observability)
- [Deployments](/deployments)
