# Deploying a Monorepo (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/deployments/monorepo.md
Original Path: docs/deployments/monorepo.md
Section: docs
Chunk: 1/2

---

# Deploying a Monorepo

Learn how to deploy monorepos on Railway.

Railway provides a few features to help improve support for deploying monorepos of various types:

1. **[Isolated Monorepo](#deploying-an-isolated-monorepo)** → A repository that contains components that are completely isolated to the
   directory they are contained in (eg. JS frontend and Python backend)
1. **[Shared Monorepo](#deploying-a-shared-monorepo)** → A repository that contains components that share code or configuration from the root directory (eg. Yarn workspace or Lerna project). We support **[automated import of Javascript monorepos](#automatic-import-for-javascript-monorepos)** for pnpm, npm, yarn or bun monorepos.

For a full step by step walk through on deploying an isolated Monorepo see the [tutorial](/tutorials/deploying-a-monorepo) on the subject.

## Deploying an isolated monorepo

The simplest form of a monorepo is a repository that contains two completely
isolated projects that do not share any code or configuration.

```
├── frontend/
│   ├── index.js
│   └── ...
└── backend/
    ├── server.py
    └── ...
```

To deploy this type of monorepo on Railway, define a root directory for the service.

1. Select the service within the project canvas to open up the service view.
2. Click on the Settings tab.
3. Set the root directory option. Setting this means that Railway will only pull down files from that directory when creating new deployments.

**Note:** The **Railway Config File** does not follow the **Root Directory** path. You have to specify the absolute path for the `railway.json` or `railway.toml` file, for example: `/backend/railway.toml`

## Deploying a shared monorepo

Popular in the JavaScript ecosystem, shared monorepos contain multiple components that all share a common root directory.

By default, all components are built with a single command from the root directory (e.g. `npm run build`). However, if you are using Nixpacks, then you can override the build command in the service settings.

```
├── package.json
└── packages
    ├── backend
    │   └── index.js
    ├── common
    │   └── index.js
    └── frontend
        └── index.jsx
```

To deploy this type of monorepo in Railway, define a separate custom start
command in Service Settings for each project that references the monorepo
codebase.

1. Select the service within the project canvas to open the service view.
2. Click on the Settings tab.
3. Set the start command, e.g. `npm run start:backend` and `npm run start:frontend`

## Automatic import for JavaScript monorepos

When you import a Javascript monorepo via [the project creation page](https://railway.com/new), we automatically detect if it's a monorepo and stage a service for each deployable package. This works for pnpm, npm, yarn and bun.

For each package detected, Railway automatically configures:

- **Service Name**: generated from the package name or directory
- **Start Command**: workspace-specific commands like `pnpm --filter [package] start`
- **Build Command**: workspace-specific commands like `pnpm --filter [package] build`
- **Watch Paths**: set to the package directory (e.g., `/packages/backend/**`)
- **Config as Code**: railway.json / railway.toml are detected at the root of the package directory

Railway filters out non-deployable packages such as configuration packages (eslint, prettier, tsconfig) and test packages.
