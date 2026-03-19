# Railway vs. Heroku (Chunk 4/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/compare-to-heroku.md
Original Path: docs/platform/compare-to-heroku.md
Section: docs
Chunk: 4/5

---

| **Category**                | **Heroku**                                                                                       | **Railway**                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Scaling Model**           | Instance-based                                                                                   | Usage-based                                                                                                      |
| **Vertical Scaling**        | Manual upgrade to larger instance sizes                                                          | Auto-scales to the plan's limits without manual intervention                                                     |
| **Horizontal Scaling**      | Manual or threshold-based autoscaling; requires setting CPU/memory limits                        | Add replicas manually; traffic routed automatically across replicas and regions                                  |
| **Autoscaling Flexibility** | Threshold-based, needs manual tuning                                                             | Fully automated; scales based on workload                                                                        |
| **Multi-region Support**    | Not natively supported; must set up separate apps + external load balancer                       | Built-in; auto-routes traffic to nearest region and balances load across replicas                                |
| **Persistent Storage**      | Not supported; ephemeral file system only                                                        | Persistent volumes are supported                                                                                 |
| **Private Networking**      | Available with paid Enterprise add-on                                                            | Included at no extra cost                                                                                        |
| **Pricing Model**           | Fixed monthly pricing per instance size. Manual tuning required to avoid under/over-provisioning | Usage-based: Charged by active compute time × resource size (CPU & RAM). Inherently optimized by dynamic scaling |
| **Infrastructure Provider** | AWS-based; higher base costs                                                                     | Railway-owned global infrastructure; lower costs and no feature gating                                           |
| **Dashboard UX**            | Traditional app-based dashboard; each app is independent                                         | Visual, collaborative canvas view for full projects with interlinked services                                    |
| **Project Structure**       | No concept of grouped services/projects                                                          | Groups all infra components visually under a unified project view                                                |
| **Environment Variables**   | Isolated per app                                                                                 | Isolated per app but can be shared across services within a project                                              |
| **Wildcard Domains**        | Not supported; manual co
