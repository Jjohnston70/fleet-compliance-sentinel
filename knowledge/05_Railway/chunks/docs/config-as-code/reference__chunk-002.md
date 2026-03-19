# Config as Code (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/config-as-code/reference.md
Original Path: docs/config-as-code/reference.md
Section: docs
Chunk: 2/3

---

### Nixpacks plan

Full nixpacks plan. See [the Nixpacks documentation](https://nixpacks.com/docs/configuration/file) for more info.

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "nixpacksPlan": {
      "providers": ["python", "node"],
      "phases": {
        "install": {
          "dependsOn": ["setup"],
          "cmds": ["npm ci"]
        }
      }
    }
  }
}
```

This field can be set to `null`.

You can also define specific options as follows.

Here's an example of adding ffmpeg to the setup phase.

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "nixpacksPlan": {
      "phases": {
        "setup": {
          "nixPkgs": ["...", "ffmpeg"]
        }
      }
    }
  }
}
```

#### Custom install command

Use nixpacksPlan to configure a custom install command.

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "nixpacksPlan": {
      "phases": {
        "install": {
          "dependsOn": ["setup"],
          "cmds": ["npm install --legacy-peer-deps"]
        }
      }
    }
  }
}
```

### Nixpacks version

Must be a valid Nixpacks version.

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "nixpacksVersion": "1.29.1"
  }
}
```

This field can be set to `null`.

You can also use the `NIXPACKS_VERSION` [configuration
variable](/variables/reference#user-provided-configuration-variables)
to set the Nixpacks version.

### Start command

The command to run when starting the container.

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "deploy": {
    "startCommand": "node index.js"
  }
}
```

This field can be set to `null`.

Read more about the start command [here](/builds/build-and-start-commands#start-command).

### Pre-deploy command

The command to run before starting the container.

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "deploy": {
    "preDeployCommand": ["npm run db:migrate"]
  }
}
```

This field can be omitted.

Read more about the pre-deploy command [here](/deployments/pre-deploy-command).

### Multi-region configuration

Horizontal scaling across multiple regions, with two replicas in each region.

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "deploy": {
    "multiRegionConfig": {
      "us-west2": {
        "numReplicas": 2
      },
      "us-east4-eqdc4a": {
        "numReplicas": 2
      },
      "europe-west4-drams3a": {
        "numReplicas": 2
      },
      "asia-southeast1-eqsg3a": {
        "numReplicas": 2
      }
    }
  }
}
```

This field can be set to `null`.

Read more about horizontal scaling with multiple regions [here](/deployments/scaling#multi-region-replicas).

### Healthcheck path

Path to check after starting your deployment to ensure it is healthy.

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "deploy": {
    "healthcheckPath": "/health"
  }
}
```

This field can be set to `null`.

Read more about the healthcheck path [here](/deployments/healthchecks).

### Healthcheck timeout

Number of seconds to wait for the healthcheck path to become healthy.

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

This field can be set to `null`.

Read more about the healthcheck timeout [here](/deployments/healthchecks).
