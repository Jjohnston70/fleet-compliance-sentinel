# Railway vs. Fly (Chunk 4/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/compare-to-fly.md
Original Path: docs/platform/compare-to-fly.md
Section: docs
Chunk: 4/6

---

### Railway

Railway follows a dashboard-first experience, while [also providing a CLI](/cli). In Railway, you create a project for each app you’re building. A project is a collection of services and databases. This can include frontend, API, background workers, API, analytics database, queues and so much more. All in a unified deployment experience that supports real-time collaboration.

![Railway architecture](https://res.cloudinary.com/railway/image/upload/v1737785173/docs/the-basics/project_canvas_dxpzxe.png)

Additionally, Railway offers a template directory that makes it easy to self-host open-source projects with just a few clicks. If you publish a template and others deploy it in their projects, you’ll earn a 25% kickback of their usage costs.

Check out all templates at [railway.com/deploy](http://railway.com/deploy)

<video
src="https://res.cloudinary.com/railway/video/upload/v1753083712/docs/railway.com_templates_zcydjb.mp4"
muted
autoplay
loop
controls>

Railway templates

You also get:

- First-class support for environments so you can isolate production, staging, development, testing, etc.
- GitHub integration with support for provisioning isolated preview environments for every pull request.
- Ability to do instant rollbacks for your deployments.

Each Railway project includes a built-in observability dashboard that provides a customizable view into chosen metrics, logs, and data all in one place

![Screenshot of the Observability Dashboard](https://res.cloudinary.com/railway/image/upload/v1717179720/Wholescreenshot_vc5l5e.png)

Finally, Railway supports creating webhooks which allow external services to listen to events from Railway

![Webhooks](https://res.cloudinary.com/railway/image/upload/v1753083711/docs/railway-webhooks_r4ervy.png)
