Title: railway project
Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/cli/project.md
Original Path: docs/cli/project.md
Section: docs

---

# railway project

Manage projects.

Manage Railway projects with subcommands for listing, linking, and deleting.

## Usage

```bash
railway project
```

## Subcommands

| Subcommand | Aliases | Description |
|------------|---------|-------------|
| `list` | `ls` | List all projects in your account |
| `link` | | Link a project to the current directory |
| `delete` | `rm`, `remove` | Delete a project |

## Examples

### List all projects

```bash
railway project list
```

### Link a project

```bash
railway project link
```

### Delete a project

```bash
railway project delete --project my-old-project
```

## Related

- [railway init](/cli/init)
- [railway link](/cli/link)
- [railway list](/cli/list)
- [railway delete](/cli/delete)
