# Philosophy (Chunk 3/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/philosophy.md
Original Path: docs/platform/philosophy.md
Section: docs
Chunk: 3/3

---

### Is Railway serverless?

No, services on Railway are deployed in stateful Docker containers. The old deployments are removed on every new deploy.

We do have a feature, [App Sleeping](/deployments/serverless), that allows you to configure your service to "sleep" when it is inactive, and therefore will stop it from incurring usage cost while not in use.

## Book a demo

If you're looking to adopt Railway for your business, we'd love to chat and ensure your questions are answered. [Click here to book some time with us](https://cal.com/team/railway/work-with-railway?duration=30).
