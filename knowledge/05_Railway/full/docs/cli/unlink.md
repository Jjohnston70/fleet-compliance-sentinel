Title: railway unlink
Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/cli/unlink.md
Original Path: docs/cli/unlink.md
Section: docs

---

# railway unlink

Disassociate project from current directory.

Remove the link between the current directory and a Railway project or service.

## Usage

```bash
railway unlink [OPTIONS]
```

## Options

| Flag | Description |
|------|-------------|
| `-s, --service` | Unlink only the service (keep project link) |
| `-y, --yes` | Skip confirmation prompt |
| `--json` | Output in JSON format |

## Examples

### Unlink project

```bash
railway unlink
```

Removes the entire project link from the current directory.

### Unlink service only

```bash
railway unlink --service
```

Keeps the project and environment link but removes the service association.

### Skip confirmation

```bash
railway unlink --yes
```

Useful for scripts and automation.

## Related

- [railway link](/cli/link)
- [railway status](/cli/status)
