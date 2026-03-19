# Deploying a Monorepo (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/deployments/monorepo.md
Original Path: docs/deployments/monorepo.md
Section: docs
Chunk: 2/2

---

## Watch paths

To prevent code changes in one service from triggering a rebuild of other services in your monorepo, you should configure watch paths.

Watch paths are [gitignore-style](https://git-scm.com/docs/gitignore#_pattern_format) patterns that can be used to trigger a new deployment based on what file paths have changed.

A monorepo might want to only trigger builds if files are changed in the `/packages/backend` directory, for example.

## Using the CLI

When interacting with your services deployed from a monorepo using the CLI, always ensure you are "linked" to the appropriate service when executing commands.

To link to a specific service from the CLI, use `railway link` and follow the prompts.
