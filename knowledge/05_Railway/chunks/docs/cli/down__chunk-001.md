# railway down (Chunk 1/1)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/cli/down.md
Original Path: docs/cli/down.md
Section: docs
Chunk: 1/1

---

# railway down

Remove the most recent deployment.

Delete the most recent successful deployment of a service.

## Usage

```bash
railway down [OPTIONS]
```

## Options

| Flag | Description |
|------|-------------|
| `-s, --service ` | Service to remove deployment from (defaults to linked service) |
| `-e, --environment ` | Environment to remove deployment from (defaults to linked environment) |
| `-y, --yes` | Skip confirmation dialog |

## Examples

### Remove latest deployment

```bash
railway down
```

### Remove from specific service

```bash
railway down --service backend
```

### Skip confirmation

```bash
railway down --yes
```

## Behavior

This command removes only the latest successful deployment. The service itself is not deleted, and you can deploy again with `railway up`.

## Related

- [railway up](/cli/up)
- [railway redeploy](/cli/redeploy)
