# GitHub Actions Self Hosted Runners (Chunk 3/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/github-actions-runners.md
Original Path: guides/github-actions-runners.md
Section: guides
Chunk: 3/4

---

## Example GitHub actions workflow

If you've never made a workflow before, here is a basic out-of-the-box example of a NuxtJS project using Bun to execute an `eslint` check.

```yml
name: eslint check

on:
  pull_request:
    branches:
      - main

permissions:
  contents: read

jobs:
  build:
    name: Check
    runs-on: [self-hosted, railway]

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Install bun
        uses: oven-sh/setup-bun@v2

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Cache Files
        uses: actions/cache@v4
        with:
          path: |
            ~/.bun/install/cache
            path: ${{ github.workspace }}/**/node_modules
            path: ${{ github.workspace }}/**/.nuxt
          key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lock', 'nuxt.config.ts', 'app.config.ts', 'app.vue') }}

      - name: Install packages
        run: bun install --prefer-offline

      - name: Lint
        run: bun run lint
```

## Best practices

1. **Only use private repositories and disable forks:** Make sure when using self-hosted runners, that you only attach them to private repositories. A known attack vector is for a malicious actor to fork a public repository and then exfiltrate your private keys from your self-hosted runners by executing workflows on them. Disabling forks can also mitigate this attack, and it's a good idea in general for locking down security on your repositories!

1. **Seal your `ACCESS_KEY`:** While all variables are encrypted on Railway, you can prevent prying eyes (including your future self) from ever viewing your API Key. Navigate to the Variables tab and next to the `ACCESS_KEY` variable click the three-dots-menu `...` -> `Seal`. Make sure your `ACCESS_KEY` is stored in a secure Password Vault before doing this!

1. **Security Harden your self-hosted Runners:** [Security Hardening](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions) will make your runners robust and prevent any concerns about your build infrastructure. GitHub's [detailed guide](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions) can help you secure secrets, authentication, auditing, and managing your runners. Similarly [dduzgun-security](https://github.com/dduzgun-security/github-self-hosted-runners) and [Wiz](https://www.wiz.io/blog/github-actions-security-guide) both have excellent guides to securing your runners that are worth your time.

### Known limitations

- Because Railway containers are non-privileged, GitHub Workflows that [build-and-then-mount](https://github.com/super-linter/super-linter) containers on the same host (i.e. Docker-in-Docker) will fail.

- Using the Serverless Setting on this Service is _not_ recommended and will result in idle runners disconnecting from GitHub and needing to reauthenticate. GitHub Runners have a 50 second HTTP longpoll which keeps them alive. While the runners in this template can automatically reauth with an `ACCESS_TOKEN` it will result in unnecessary offline / abandoned runners. If you want your runners to deauthenticate and spin down, consider using ephemeral runners instead.
