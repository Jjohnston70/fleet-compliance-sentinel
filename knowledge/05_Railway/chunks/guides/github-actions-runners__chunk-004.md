# GitHub Actions Self Hosted Runners (Chunk 4/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/github-actions-runners.md
Original Path: guides/github-actions-runners.md
Section: guides
Chunk: 4/4

---

### Troubleshooting self-hosted runner communication

> A self-hosted runner connects to GitHub to receive job assignments and to download new versions of the runner application. The self-hosted runner uses an HTTPS long poll that opens a connection to GitHub for 50 seconds, and if no response is received, it then times out and creates a new long poll. The application must be running on the machine to accept and run GitHub Actions jobs.

GitHub's [documentation details all of the different endpoints](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/communicating-with-self-hosted-runners) your self-hosted runner needs to communicate with. If you are operating in a [GitHub Allow List](https://docs.github.com/en/enterprise-cloud@latest/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/managing-allowed-ip-addresses-for-your-organization) environment you must add your self-hosted runners IP Address to this allow list for communication to work.

If you are using a [proxy server](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/using-a-proxy-server-with-self-hosted-runners), refer to GitHub's documentation on configuring your self-hosted runner. You can simply add the required environment variables by adding them to the Variables tab of your Service.

### Cost comparison

On Railway you only [pay for what you use](/pricing/plans), so you'll find your GitHub workflows are significantly cheaper. For this guide, over ~2,300 1-minute builds were tested on Railway self-hosted runners and the usage costs were `$1.80` compared to [GitHub's Estimated Hosted Runner](https://github.com/pricing/calculator?feature=actions) cost of `$18.40` for the same workload. Even better? With 10x Railway replicas with 32 vCPU and 32GB RAM for this test, the actions workflows would never slow down.

On other platforms you pay for the _maximum available_ vCPUs and Memory. On Railway, you're only paying for usage, or in the below screenshot, the filled in purple area. This enables your workloads to still burst up to the _maximum available_ resources you have configured, with no tradeoffs on cost.
