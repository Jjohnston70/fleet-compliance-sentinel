Title: railway init
Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/cli/init.md
Original Path: docs/cli/init.md
Section: docs

---

# railway init

Create a new project.

Create a new Railway project and link it to the current directory.

## Usage

```bash
railway init [OPTIONS]
```

## Aliases

- `railway new`

## Options

| Flag | Description |
|------|-------------|
| `-n, --name ` | Project name (randomly generated if not provided) |
| `-w, --workspace ` | Workspace to create the project in |
| `--json` | Output in JSON format |

## Examples

### Interactive project creation

```bash
railway init
```

Prompts you to select a workspace and enter a project name.

### Create with specific name

```bash
railway init --name my-api
```

### Create in specific workspace

```bash
railway init --name my-api --workspace "My Team"
```

### Non-interactive (CI/CD)

```bash
railway init --name my-api --workspace my-team-id --json
```

## Output

After creation, the project is automatically linked to your current directory. You can start deploying with `railway up`.

## Related

- [railway link](/cli/link)
- [railway up](/cli/up)
- [railway project](/cli/project)
