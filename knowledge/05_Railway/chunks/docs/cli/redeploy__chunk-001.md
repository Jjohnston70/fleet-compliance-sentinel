# railway redeploy (Chunk 1/1)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/cli/redeploy.md
Original Path: docs/cli/redeploy.md
Section: docs
Chunk: 1/1

---

# railway redeploy

Redeploy the latest deployment of a service.

Redeploy the most recent deployment of a service without uploading new code.

## Usage

```bash
railway redeploy [OPTIONS]
```

## Options

| Flag | Description |
|------|-------------|
| `-s, --service ` | Service to redeploy (defaults to linked service) |
| `-y, --yes` | Skip confirmation dialog |
| `--json` | Output in JSON format |

## Examples

### Redeploy current service

```bash
railway redeploy
```

### Redeploy specific service

```bash
railway redeploy --service backend
```

### Skip confirmation

```bash
railway redeploy --yes
```

## Use cases

Redeploying is useful for:
- Applying environment variable changes
- Restarting a service that crashed
- Triggering a fresh deployment with the same code

## Related

- [railway up](/cli/up)
- [railway restart](/cli/restart)
- [railway logs](/cli/logs)
