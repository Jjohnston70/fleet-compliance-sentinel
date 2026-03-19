Title: railway delete
Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/cli/delete.md
Original Path: docs/cli/delete.md
Section: docs

---

# railway delete

Delete a project.

Permanently delete a Railway project.

## Usage

```bash
railway delete [OPTIONS]
```

## Options

| Flag | Description |
|------|-------------|
| `-p, --project ` | Project to delete |
| `-y, --yes` | Skip confirmation dialog |
| `--2fa-code ` | 2FA code for verification (if 2FA is enabled) |
| `--json` | Output in JSON format |

## Examples

### Interactive deletion

```bash
railway delete
```

Prompts you to select a project and confirm deletion.

### Delete specific project

```bash
railway delete --project my-old-project
```

### Skip confirmation

```bash
railway delete --project my-old-project --yes
```

### With 2FA Code

```bash
railway delete --project my-project --yes --2fa-code 123456
```

## Warning

This action is **permanent** and cannot be undone. All services, deployments, and data within the project will be deleted.

## Related

- [railway init](/cli/init)
- [railway list](/cli/list)
