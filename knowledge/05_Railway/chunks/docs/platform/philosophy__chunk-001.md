# Philosophy (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/philosophy.md
Original Path: docs/platform/philosophy.md
Section: docs
Chunk: 1/3

---

# Philosophy

Explore Railway’s core philosophy and the principles that drive the Railway platform.

Railway is a deployment platform that helps developers deliver their software through the entire application life-cycle through git native tooling, composable infrastructure, and built-in instrumentation.

We design and develop Railway's product features to serve what we consider to be the three primary stages of software development:

- Development
- Deployment
- Diagnosis

Most developer-oriented products attempt to target one or more stages within the software development cycle. Railway provides solutions for developers for all of these stages, whereas some vendors focus on specific stages.

Railway is a company staffed with people who know developers would prefer to use tools they are familiar with. We believe software should be "take what you need, and leave what you don't." As a result, we are comfortable recommending additional vendors if they might acutely meet their needs. Railway's goal is for your unique need to be served so you can focus on delivering for your customers.

Companies should be as upfront as possible about their product and offerings to help you decide what is best for your team and users.

Let's talk about the number one use case: delivering apps to users in a Production environment. Railway, the company, is sustainable, building Railway's product, team, and company to last as long as your projects.

## Objective

The goal of this section is to describe the processes, internal and external that companies have requested in Railway's years of operation to help them build confidence to determine if Railway is a good fit for their company. Railway maintains a policy to be forthcoming and frank at all times. We would rather have a developer make the correct choice for their company than to adopt Railway and then come to regret that decision.

If you have any additional questions or if you require any additional disclosure you can contact us to set up a call at [team@railway.com](mailto:team@railway.com).

## Product philosophy

Railway is focused on building an amazing developer experience. Railway's goal is to enable developers to deploy their code and see their work in action, without thinking about CI/CD, deployments, networking, and so forth, until they need to.

### Take what you need

To achieve this goal, we've designed Railway to "just work", with all the necessary magic built in to achieve that. Railway at a high level reads your code repo, makes a best guess effort to build it into an [OCI compliant image](https://opencontainers.org/), and runs the image with a start command.

- Have a code repository but have yet to think about deployment? We got you. Connect your code repository and let Railway take care of the rest.
- Already built the perfect Dockerfile? Bring it. If you have a Dockerfile in your repo, we'll find it and use that to build your image.

If you've outgrown the "magic" built into deployment platforms, or are suspicious of things that are just too magical, we are happy to provide a high level overview of Railway's architecture.
