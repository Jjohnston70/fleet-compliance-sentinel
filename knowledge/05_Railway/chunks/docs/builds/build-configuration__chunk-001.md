# Build Configuration (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/builds/build-configuration.md
Original Path: docs/builds/build-configuration.md
Section: docs
Chunk: 1/2

---

# Build Configuration

Learn how to configure Railpack, optimize build caching, and set up watchpaths.

Railway will build and deploy your code with zero configuration, but when necessary, there are several ways to configure this behavior to suit your needs.

## Railpack

Railway uses [Railpack](https://railpack.com) to
build your code. It works with zero configuration, but can be customized using
[environment variables](/variables#service-variables) or a [config
file](https://railpack.com/config/file). Configuration options include:

- Language versions
- Build/install/start commands
- Mise and Apt packages to install
- Directories to cache

For a full list of configuration options, please view the <a
href="https://railpack.com/config/environment-variables"
target="_blank">Railpack docs. You can find a complete list of languages we
support out of the box [here](/builds/railpack#supported-languages).

## Nixpacks

Existing services will continue to work with Nixpacks. To migrate to Railpack, update your service settings or set `"builder": "RAILPACK"` in your railway.json file.

For services still using Nixpacks, it can be configured with [environment variables](/variables#service-variables). For a full list of options, view the [Nixpacks docs](https://nixpacks.com/docs/guides/configuring-builds).

You can find a complete list of languages we support out of the box [here](/builds/nixpacks#supported-languages).

## Customize the build command

You can override the detected build command by setting a value in your service
settings. This is run after languages and packages have been installed.

## Set the root directory

The root directory defaults to `/` but can be changed for various use-cases like
[monorepo](/deployments/monorepo) projects.

When specified, all build and deploy
commands will operate within the defined root directory.

**Note:** The **Railway Config File** does not follow the **Root Directory** path. You have to specify the absolute path for the `railway.json` or `railway.toml` file, for example: `/backend/railway.toml`

## Configure watch paths

Watch paths are [gitignore-style](https://git-scm.com/docs/gitignore#_pattern_format) patterns
that can be used to trigger a new deployment based on what file paths have
changed.

For example, a monorepo might want to only trigger builds if files are
changed in the `/packages/backend` directory.

When specified, any changes that
don't match the patterns will skip creating a new deployment. Multiple patterns
can be combined, one per line.

_Note, if a Root Directory is provided, patterns still operate from `/`. For a root directory of `/app`, `/app/**.js` would be used as a pattern to match files in the new root._

Here are a few examples of common use-cases:

```gitignore

# Match all TypeScript files under src/
/src/**/*.ts
```

```gitignore

# Match Go files in the root, but not in subdirectories
/*.go
```

```gitignore

# Ignore all markdown files
**
!/*.md
```

_Note, negations will only work if you include files in a preceding rule._
