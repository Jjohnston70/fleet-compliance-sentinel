# Production Readiness Checklist (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/overview/production-readiness-checklist.md
Original Path: docs/overview/production-readiness-checklist.md
Section: docs
Chunk: 2/3

---

## Observability and monitoring

Observability and monitoring refers to tracking the health and performance of your application. Consider taking the following actions to ensure you are able to track your application health -

**&check; Get familiar with the log explorer**

- When researching an application issue across multiple services, it can be disruptive and time-consuming to move between log views for each service individually.

  Familiarize yourself with the [Log Explorer](/observability/logs#log-explorer) so you can query logs across all of your services in one place.

**&check; Setup webhooks, email, and in-app notifications**

- Ensure you are alerted if the [deployment status](/deployments/reference#deployment-states) of your services change.

  Enable email and in-app notifications in you Account Settings to receive these alerts via email.

  Setup [webhooks](/deployments/reference#deployment-states) to have the alerts sent to another system, like Slack or Discord.

---

## Quality assurance

Quality assurance involves following practices to ensure changes to your application code meet quality standards before they are deployed to production. Consider the following actions to ensure you're set up for success -

**&check; Implement check suites**

- Common practice is to run a suite of tests, scans, or other automated jobs against your code before it is merged into production. You may want to configure your deployments to wait until those jobs have completed successfully before triggering a build.

  Enable [check suites](/deployments/github-autodeploys#check-suites) to have Railway wait for your GitHub workflows to complete successfully before triggering a deployment.

**&check; Use environments**

- Maintaining separate environments for production and development is good practice for controlling changes in a production environment.

  Consider setting up [environments](/environments) to properly test changes before merging to production.

  Additionally, [PR environments](/environments#enable-pr-environments) can be enabled to create environments when PRs are opened on your production branch.

**&check; Use config as code**

- Along with your source code, you can maintain your Railway configuration in a `json` or `toml` file, enabling you to keep track of changes, just as you do with your source code.

  Take advantage of [config as code](/config-as-code) to control and track changes to your Railway configuration.

**&check; Understand the deployment rollback feature**

- Introducing breaking changes to your application code is sometimes unavoidable, and it can be a headache reverting to previous commits.

  Be sure to check out the [deployment rollback feature](/deployments/deployment-actions#rollback), in case you need to rollback to a previous deployment.

---
