# GitHub Actions Self Hosted Runners (Chunk 2/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/github-actions-runners.md
Original Path: guides/github-actions-runners.md
Section: guides
Chunk: 2/4

---

## Setup a GitHub access_token

For this guide, you will create a new [GitHub Fine-Grained Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#fine-grained-personal-access-tokens). These are modern personal access tokens that obey the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege), making them easy to secure, revoke, and audit!

**Note:** You need to have Admin access to the organization for which you are making the `ACCESS_TOKEN`.

1. Create a new fine-grained personal access token. [Navigate to your Settings -> Developer Settings -> Personal Access Token -> Fine-grained tokens -> Generate New Token](https://github.com/settings/personal-access-tokens)
1. Set the Resource owner as your Organization. Alternatively, if you are using a `ent` `RUNNER_SCOPE`, select your Enterprise.
1. Set Expiration
1. Under Permissions, Select Organization Permissions -> Self Hosted Runners -> Read and Write (If Enterprise, select Enterprise instead).
1. Click Generate. Save your `ACCESS_TOKEN` in a safe place! You won't see it again. (Save it in a Password Vault as an API Key!)
1. DONE. You don't need any other permissions!

## Scaling up your Railway self hosted runners

1. Navigate to the Settings tab of your Service to the Region area.
1. Change the number next to your region from `1` to your desired number of replicas.
1. Click Deploy.
1. Done! Your new replicas will automatically spin up and register themselves with GitHub.

## View your registered self hosted runners

You can view all your runners by navigating to your organization's Actions -> Runners page at https://github.com/organizations/(your-organization-name)/settings/actions/runners?page=1

## Routing actions jobs

You can route jobs by simply changing the `LABELS` variable. By default, we include the `railway` label on runners you make through the [Template](https://railway.com/new/template/pXId5Q?teamId=d546a817-7743-4892-b03a-f5a75df596f9). `LABELS` is a comma (no spaces) delimited list of all the labels you want to appear on that runner. This enables you to [route jobs](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/using-self-hosted-runners-in-a-workflow#using-custom-labels-to-route-jobs) with the specificity that your workflows need, while still allowing you to make runners available for your entire Organization.

## Setting up GitHub actions workflows for pull requests

GitHub Actions uses workflow files located in `.github/workflows/.yml`. You can easily incorporate pre-built steps to get up-and-running quickly.

- When you want to run a workflow every time a pull request is opened, set the `on` key to `pull_request` in your `.github/workflows/.yml`.

- Set the `runs-on` key when you want to route your workflow job to a particular runner. Use a comma delimited list for greater specificity. For example, a `[self-hosted, linux, x86, railway]` workflow needs to match all labels to an appropriate runner in order to route the job correctly.
