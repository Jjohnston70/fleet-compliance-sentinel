# Config as Code (Chunk 3/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/config-as-code/reference.md
Original Path: docs/config-as-code/reference.md
Section: docs
Chunk: 3/3

---

### Restart policy type

How to handle the deployment crashing.

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "deploy": {
    "restartPolicyType": "ALWAYS"
  }
}
```

Possible values are:

- `ON_FAILURE`
- `ALWAYS`
- `NEVER`

Read more about the Restart policy [here](/deployments/restart-policy).

### Restart policy max retries

Set the max number of retries for the restart policy.

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "deploy": {
    "restartPolicyType": "ALWAYS",
    "restartPolicyMaxRetries": 5
  }
}
```

This field can be set to `null`.

Read more about the Restart policy [here](/deployments/restart-policy).

### cron schedule

[Cron schedule](/cron-jobs) of the deployed service.

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "deploy": {
    "cronSchedule": "*/15 * * * *"
  }
}
```

This field can be set to `null`.

### Setting environment overrides

Configuration can be overridden for a specific environment by nesting it in a
`environments.[name]` block.

When resolving the settings for a deployment, Railway will use this priority order:

1. Environment specific config in code
2. Base config in code
3. Service settings

The following example changes the start command just in the production
environment.

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "environments": {
    "staging": {
      "deploy": {
        "startCommand": "npm run staging"
      }
    }
  }
}
```

#### PR environment overrides

Deployments for pull requests can be configured using a special `pr` environment. This configuration is applied only to deploys that belong to an ephemeral environment. When resolving the settings for a PR deployment, the following priority order is used:

1. Environment with the name of the ephemeral environment
2. Environment with the hardcoded name "pr"
3. Base environment of the pull request
4. Base config as code
5. Service settings

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "environments": {
    "pr": {
      "deploy": {
        "startCommand": "npm run pr"
      }
    }
  }
}
```

### Configuring a build provider with Nixpacks

To define a build provider ahead of time, create a `nixpacks.toml` file and configure it like so:

```toml
providers = ["...", "python"]
```

### Deployment teardown

You can configure [Deployment Teardown](/deployments/deployment-teardown) settings to tune the behavior of zero downtime deployments on Railway.

#### Overlap seconds

Time in seconds that the previous deploy will overlap with the newest one being deployed. Read more about the deployment's lifecycle [here](/deployments).

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "deploy": {
    "overlapSeconds": "60"
  }
}
```

This field can be set to `null`.

#### Draining seconds

The time in seconds between when the previous deploy is sent a SIGTERM to the time it is sent a SIGKILL. Read more about the deployment's lifecycle [here](/deployments).

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "deploy": {
    "drainingSeconds": "10"
  }
}
```

This field can be set to `null`.
