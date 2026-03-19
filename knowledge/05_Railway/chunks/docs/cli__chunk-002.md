# CLI (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/cli.md
Original Path: docs/cli.md
Section: docs
Chunk: 2/2

---

### Variables

```bash
railway variable list           # List variables
railway variable set KEY=value  # Set a variable
railway variable delete KEY     # Delete a variable
```

[variable](/cli/variable)

### Environments

```bash
railway environment             # Switch environment (interactive)
railway environment new staging # Create new environment
railway environment delete dev  # Delete an environment
```

[environment](/cli/environment)

### Local development

```bash
railway run npm start           # Run command with Railway env vars
railway shell                   # Open shell with Railway env vars
railway dev                     # Run services locally with Docker
```

[run](/cli/run) · [shell](/cli/shell) · [dev](/cli/dev)

### Logs & debugging

```bash
railway logs                    # Stream deployment logs
railway logs --build            # View build logs
railway logs -n 100             # View last 100 lines
railway ssh                     # SSH into service container
railway connect                 # Connect to database shell
```

[logs](/cli/logs) · [ssh](/cli/ssh) · [connect](/cli/connect)

### Networking

```bash
railway domain                  # Generate Railway domain
railway domain example.com      # Add custom domain
```

[domain](/cli/domain)

### Volumes

```bash
railway volume list             # List volumes
railway volume add              # Add a volume
railway volume delete           # Delete a volume
```

[volume](/cli/volume)

### Functions

```bash
railway functions list          # List functions
railway functions new           # Create a function
railway functions push          # Push function changes
```

[functions](/cli/functions)

### Utilities

```bash
railway completion bash         # Generate shell completions
railway docs                    # Open documentation
railway upgrade                 # Upgrade CLI
```

[completion](/cli/completion) · [docs](/cli/docs) · [upgrade](/cli/upgrade) · [starship](/cli/starship)

## Global options

These flags are available across multiple commands:

| Flag | Description |
|------|-------------|
| `-s, --service` | Target service (name or ID) |
| `-e, --environment` | Target environment (name or ID) |
| `--json` | Output in JSON format |
| `-y, --yes` | Skip confirmation prompts |
| `-h, --help` | Display help information |
| `-V, --version` | Display CLI version |

See [Global Options](/cli/global-options) for more details.

## SSH

The Railway CLI enables you to start a shell session inside your deployed Railway services:

```bash
railway ssh
```

Copy the exact command from the Railway dashboard by right-clicking on a service and selecting "Copy SSH Command".

See [railway ssh](/cli/ssh) for more details.

## Contributing

The Railway CLI is open source. Contribute to the development of the Railway CLI by opening an issue or Pull Request on the [GitHub Repo](https://github.com/railwayapp/cli).
