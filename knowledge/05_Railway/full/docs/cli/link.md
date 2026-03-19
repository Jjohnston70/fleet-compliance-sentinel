Title: railway link
Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/cli/link.md
Original Path: docs/cli/link.md
Section: docs

---

# railway link

Associate an existing project with the current directory.

Link an existing Railway project to the current directory. Once linked, commands like `railway up` and `railway logs` will target this project.

## Usage

```bash
railway link [OPTIONS]
```

## Options

| Flag | Description |
|------|-------------|
| `-p, --project ` | Project to link to |
| `-e, --environment ` | Environment to link to |
| `-s, --service ` | Service to link to |
| `-w, --workspace ` | Workspace to link to |
| `-t, --team ` | Team to link to (deprecated, use `--workspace`) |
| `--json` | Output in JSON format |

## Examples

### Interactive linking

```bash
railway link
```

Prompts you to select a workspace, project, environment, and optionally a service.

### Link to specific project

```bash
railway link --project my-api
```

### Link to specific environment

```bash
railway link --project my-api --environment staging
```

### Link to specific service

```bash
railway link --project my-api --service backend
```

### Non-interactive (CI/CD)

```bash
railway link --project abc123 --environment def456 --json
```

## How it works

Railway stores the link configuration in a `.railway` directory in your project root. This file is typically added to `.gitignore`.

The link includes:
- Project ID
- Environment ID
- Service ID (optional)

## Related

- [railway unlink](/cli/unlink)
- [railway init](/cli/init)
- [railway status](/cli/status)
