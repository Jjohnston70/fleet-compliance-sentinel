# Application Failed to Respond (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/networking/troubleshooting/application-failed-to-respond.md
Original Path: docs/networking/troubleshooting/application-failed-to-respond.md
Section: docs
Chunk: 2/2

---

### Application under heavy load

If you think your application could be under heavy load, you can confirm this by checking the `Metrics` tab within your service panel.

For example, if you are running a Node.js application, and see that your vCPU usage has peaked at any point to around 1 vCPU, this is a good indication that your application is under heavy load given Node's single-threaded nature.

If this is the case, you can scale your application horizontally to handle more requests.

[Horizontal scaling](/deployments/scaling#horizontal-scaling-with-replicas) can easily be done by adding more instances to one or more regions.
