# railway status (Chunk 1/1)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/cli/status.md
Original Path: docs/cli/status.md
Section: docs
Chunk: 1/1

---

# railway status

Show information about the current project.

Display information about the currently linked project, environment, and service.

## Usage

```bash
railway status [OPTIONS]
```

## Options

| Flag | Description |
|------|-------------|
| `--json` | Output in JSON format |

## Examples

### Show current status

```bash
railway status
```

Output:
```
Project: my-api
Environment: production
Service: backend
```

### JSON output

```bash
railway status --json
```

Returns detailed project information including all services and environments.

## Related

- [railway link](/cli/link)
- [railway open](/cli/open)
