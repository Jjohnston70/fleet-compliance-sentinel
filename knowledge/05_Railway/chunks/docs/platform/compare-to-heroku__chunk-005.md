# Railway vs. Heroku (Chunk 5/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/compare-to-heroku.md
Original Path: docs/platform/compare-to-heroku.md
Section: docs
Chunk: 5/5

---

nfiguration needed per subdomain                                         | Fully supported; configure at the project level                                                                  |

## Migrate from Heroku to Railway

To get started, [create an account on Railway](https://railway.com/new). You can sign up for free and receive $5 in credits to try out the platform.

### Deploying your app

1. “Choose Deploy from GitHub repo”, connect your GitHub account, and select the repo you would like to deploy.

![Railway onboarding new project](https://res.cloudinary.com/railway/image/upload/v1753470545/docs/comparison-docs/railway-onboarding-new-project_qqftnj.png)

2. If your project is using any environment variables or secrets:
   1. Click on the deployed service.
   2. Navigate to the “Variables” tab.
   3. Add a new variable by clicking the “New Variable” button. Alternatively, you can import a `.env` file by clicking “Raw Editor” and adding all variables at once.

![Railway environment variables](https://res.cloudinary.com/railway/image/upload/v1753470542/docs/comparison-docs/railway-service-environment-variables_hbvrct.png)

3. To make your project accessible over the internet, you will need to configure a domain:
   1. From the project’s canvas, click on the service you would like to configure.
   2. Navigate to the “Settings” tab.
   3. Go to the “Networking” section.
   4. You can either:
      1. Generate a Railway service domain: this will make your app available under a `.up.railway.app` domain.
      2. Add a custom domain: follow the DNS configuration steps.

## Need help or have questions?

If you need help along the way, the [Railway Discord](http://discord.gg/railway) and [Help Station](https://station.railway.com/) are great resources to get support from the team and community.

Working with a larger workload or have specific requirements? [Book a call with the Railway team](https://cal.com/team/railway/work-with-railway) to explore how we can best support your project.
