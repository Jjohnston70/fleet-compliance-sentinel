Title: railway whoami
Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/cli/whoami.md
Original Path: docs/cli/whoami.md
Section: docs

---

# railway whoami

Get the current logged in user.

Display information about the currently logged in user.

## Usage

```bash
railway whoami [OPTIONS]
```

## Options

| Flag | Description |
|------|-------------|
| `--json` | Output in JSON format |

## Examples

### Display current user

```bash
railway whoami
```

Output:
```
Logged in as John Doe (john@example.com) 👋
```

### JSON output

```bash
railway whoami --json
```

Output:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "workspaces": [
    {
      "id": "workspace-id",
      "name": "My Team"
    }
  ]
}
```

## Related

- [railway login](/cli/login)
- [railway logout](/cli/logout)
