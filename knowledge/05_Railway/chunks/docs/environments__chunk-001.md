# Environments (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/environments.md
Original Path: docs/environments.md
Section: docs
Chunk: 1/2

---

# Environments

Manage complex development workflows via environments in your projects on Railway.

Railway supports complex development workflows through environments, giving you isolated instances of all services in a project.

## How it works

All projects in Railway are created with a `production` environment by default. Once a project has been created, new environments can be created and configured to complement any development workflow.

All changes made to a service are scoped to a single environment. This means that you can make changes to a service in an environment without affecting other environments.

## Types of environments

### Persistent environments

Persistent environments are intended to persist but remain isolated from production with regard to their configuration.

For example, it is a common pattern to maintain a `staging` environment that is configured to auto-deploy from a `staging` branch and with variables relevant to `staging`.

### PR environments

[PR Environments](#pr-environments-1) are temporary. They are created when a Pull Request is opened on a branch and are deleted as soon as the PR is merged or closed.

## Use cases

Environments are generally used for isolating changes from the production environment, to iterate and test before pushing to production.

- Have development environments for each team member that are identical to the production environment
- Have separate staging and production environments that auto-deploy when changes are made to different branches in a code repository.

## Create an environment

1. Select `+ New Environment` from the environment drop down in the top navigation. You can also go to Settings > Environments.
2. Choose which type of environment to create -

   - **Duplicate Environment** creates a copy of the selected environment, including services, variables, and configuration.

     When the duplicate environment is created, all services and their configuration will be staged for deployment.
     _You must review and approve the [staged changes](/deployments/staged-changes) before the services deploy._

   - **Empty Environment** creates an empty environment with no services.

## Sync environments

You can easily sync environments to _import_ one or more services from one environment into another environment.

1. Ensure your current environment is the one that should _receive_ the synced service(s)
2. Click `Sync` at the top of the canvas
3. Select the environment from which to sync changes
4. Upon sync, each service card that has received a change will be tagged "New", "Edited", "Removed"
5. Review the [staged changes](/deployments/staged-changes) by clicking Details on the staged changes banner
6. Click "Deploy" once you are ready to apply the changes and re-deploy

## PR environments

Railway can spin up a temporary environment whenever you open a Pull Request. To enable PR environments, go to your Project Settings -> Environments tab.

When enabled, a temporary environment is spun up to support the Pull Request deploy. These environments are deleted as soon as these PRs are merged or closed.

### How come my GitHub PR won't deploy?

Railway will not deploy a PR branch from a user who is not in your workspace or invited to your project without their associated GitHub account.
