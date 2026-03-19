# GitHub Actions Self Hosted Runners (Chunk 1/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/github-actions-runners.md
Original Path: guides/github-actions-runners.md
Section: guides
Chunk: 1/4

---

# GitHub Actions Self Hosted Runners

Learn how to deploy your own scalable self hosted GitHub Actions Runners on Railway. Build your own fleet of runners for your Enterprise and then scale your self-hosted runners with Railway replicas for blazing fast builds.

Deploying [GitHub Actions Self Hosted Runners](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners) on Railway is an excellent way to run your own CI infrastructure because you only [pay for what you use](/pricing/plans). With self-hosted runners, you also unlock the ability to cache expensive and time-consuming dependencies (`node_modules`, `cargo`, etc.) or large git repositories. Best of all, Railway's built-in [replicas](/deployments/scaling#horizontal-scaling-with-replicas) means you can scale your runners horizontally, or even distribute them to different regions with just a click and redeploy. You'll save build times and costs over using standard runners, _AND_ you'll unlock more sophistocated workflows to streamline building your app.

In this guide you'll learn:

1. The basics to deploy a GitHub Actions Self Hosted Runner on Railway.
1. How to authenticate self-hosted runners on Railway with your GitHub Organization or Enterprise.
1. How to scale up [replicas](/deployments/scaling#horizontal-scaling-with-replicas) to serve bigger Actions workloads.
1. Best Practices for configuring your self-hosted runners on Railway.

**Quickstart:** [Deploy your self-hosted Runners with the Railway template](https://railway.com/new/template/pXId5Q?teamId=d546a817-7743-4892-b03a-f5a75df596f9).

## Deploy a GitHub self-hosted runner on Railway

1. Navigate to the [GitHub Actions self-hosted Runner Template](https://railway.com/new/template/pXId5Q?teamId=d546a817-7743-4892-b03a-f5a75df596f9). You'll notice the template requires an `ACCESS_TOKEN`. This token, along with your `RUNNER_SCOPE` will determine _where_ your self-hosted runners get registered on GitHub. Thankfully, this template supports self registration of your runners -- which means you can dynamically scale up or down the number of runners you have just by adjusting your `replicas`!

2. Set your `RUNNER_SCOPE` to `org`. This sets up your self-hosted runners to register with a GitHub Organization, so any repositories within your organization can use the same pool of runners. This is super useful because you don't have to set up permissions for every single repository!

If you have a GitHub Enterprise, you can similarly set up your runners using an `ACCESS_TOKEN`, you just need to set your `RUNNER_SCOPE` as `ent` instead.

If you need additional configuration, then you can simply [add a variable to your Service](https://github.com/myoung34/docker-github-actions-runner?tab=readme-ov-file#environment-variables).
