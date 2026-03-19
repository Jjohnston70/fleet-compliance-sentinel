# Config as Code (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/config-as-code/reference.md
Original Path: docs/config-as-code/reference.md
Section: docs
Chunk: 1/3

---

# Config as Code

Learn how to manage and deploy apps on Railway using config as code with toml and json files.

Railway supports defining the configuration for a single deployment in a file
alongside your code. By default, we will look for a `railway.toml` or
`railway.json` file.

Everything in the build and deploy sections of the service
settings can be specified in this configuration file.

## How does it work?

When a new deployment is triggered, Railway will look for any config files in your
code and combine these values with the settings from the dashboard.

The resulting build and deploy config will be used **only for the current deployment**.

The settings in the dashboard will not be updated with the settings defined in
code.

Configuration defined in code will always override values from the
dashboard.

## Config source location

On the deployment details page, all the settings that a deployment went out with are shown. For settings that come from a configuration file, there is a little file icon. Hovering over the icon will show exactly what part of the file the values originated from.

## Configurable settings

### Specify the builder

Set the builder for the deployment.

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "RAILPACK"
  }
}
```

Possible values are:

- `RAILPACK` (default)
- `DOCKERFILE`
- `NIXPACKS` (deprecated)

Note: Railway will always build with a Dockerfile if it finds one. New services default to Railpack unless otherwise specified.

Read more about Builds [here](/builds).

### Watch patterns

Array of patterns used to conditionally trigger a deploys.

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "watchPatterns": ["src/**"]
  }
}
```

Read more about watch patterns [here](/builds/build-configuration#configure-watch-paths).

### Build command

Build command to pass to the Nixpacks builder.

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "buildCommand": "yarn run build"
  }
}
```

This field can be set to `null`.

Read more about the build command [here](/builds/build-and-start-commands#build-command).

### Dockerfile path

Location of non-standard Dockerfile.

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "dockerfilePath": "Dockerfile.backend"
  }
}
```

This field can be set to `null`.

More about building from a Dockerfile [here](/builds/dockerfiles).

### Railpack version

Must be a valid [Railpack version](https://github.com/railwayapp/railpack/releases).

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "railpackVersion": "0.7.0"
  }
}
```

This field can be set to `null`.

You can also use the `RAILPACK_VERSION` [configuration
variable](/variables/reference#user-provided-configuration-variables)
to set the Railpack version.

### Nixpacks config path

Location of a non-standard [Nixpacks](https://nixpacks.com/docs/configuration/file) config file. This setting only applies to services using the deprecated Nixpacks builder.

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "nixpacksConfigPath": "backend_nixpacks.toml"
  }
}
```

This field can be set to `null`.
