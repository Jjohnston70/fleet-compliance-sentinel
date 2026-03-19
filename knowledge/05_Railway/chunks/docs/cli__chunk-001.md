# CLI (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/cli.md
Original Path: docs/cli.md
Section: docs
Chunk: 1/2

---

# CLI

Learn how to install and use the Railway CLI to manage your projects.

The Railway Command Line Interface (CLI) lets you interact with your Railway projects from the command line.

## Installing the CLI

The Railway CLI can be installed via Homebrew, npm, Scoop, or directly from the source.

### Homebrew (macOS)

```bash
brew install railway
```

### npm (macOS, Linux, Windows)

```bash
npm i -g @railway/cli
```

Requires Node.js version 16 or higher.

### Shell script (macOS, Linux, Windows via WSL)

```bash
bash <(curl -fsSL cli.new)
```

On Windows, use [Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/install) with a Bash shell.

### Scoop (Windows)

```ps1
scoop install railway
```

### Pre-built binaries

Download [pre-built binaries](https://github.com/railwayapp/cli/releases/latest) from the [GitHub repository](https://github.com/railwayapp/cli).

### From source

Build from source using the instructions in the [GitHub repository](https://github.com/railwayapp/cli#from-source).

## Authentication

Before using the CLI, authenticate with your Railway account:

```bash
railway login
```

For environments without a browser (e.g., SSH sessions), use browserless login:

```bash
railway login --browserless
```

### Tokens

For CI/CD pipelines, set environment variables instead of interactive login:

- **Project Token**: Set `RAILWAY_TOKEN` for project-level actions
- **Account/Workspace Token**: Set `RAILWAY_API_TOKEN` for account-level actions

```bash
RAILWAY_TOKEN=xxx railway up
```

See [Tokens](/integrations/api#project-token) for more information.

## Available commands

### Authentication

```bash
railway login                   # Login to Railway
railway login --browserless     # Login without browser
railway logout                  # Logout from Railway
railway whoami                  # Show current user
```

[login](/cli/login) · [logout](/cli/logout) · [whoami](/cli/whoami)

### Project management

```bash
railway init                    # Create a new project
railway link                    # Link to existing project
railway unlink                  # Unlink current directory
railway list                    # List all projects
railway status                  # Show project info
railway open                    # Open in browser
```

[init](/cli/init) · [link](/cli/link) · [unlink](/cli/unlink) · [list](/cli/list) · [status](/cli/status) · [open](/cli/open) · [project](/cli/project)

### Deployment

```bash
railway up                      # Deploy current directory
railway up --detach             # Deploy without streaming logs
railway deploy --template postgres # Deploy a template
railway redeploy                # Redeploy latest deployment
railway restart                 # Restart a service
railway down                    # Remove latest deployment
```

[up](/cli/up) · [deploy](/cli/deploy) · [redeploy](/cli/redeploy) · [restart](/cli/restart) · [down](/cli/down) · [Deploying Guide](/cli/deploying)

### Services

```bash
railway add                     # Add a service (interactive)
railway add --database postgres # Add PostgreSQL
railway add --repo user/repo    # Add from GitHub repo
railway service                 # Link a service
railway scale                   # Scale a service
railway delete                  # Delete a project
```

[add](/cli/add) · [service](/cli/service) · [scale](/cli/scale) · [delete](/cli/delete)
