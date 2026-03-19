Title: railway add
Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/cli/add.md
Original Path: docs/cli/add.md
Section: docs

---

# railway add

Add a service to your project.

Add a new service to your Railway project. You can add databases, GitHub repos, Docker images, or empty services.

## Usage

```bash
railway add [OPTIONS]
```

## Options

| Flag | Description |
|------|-------------|
| `-d, --database ` | Add a database (postgres, mysql, redis, mongo) |
| `-s, --service [NAME]` | Create an empty service (optionally with a name) |
| `-r, --repo ` | Create a service from a GitHub repo |
| `-i, --image ` | Create a service from a Docker image |
| `-v, --variables ` | Environment variables to set on the service |
| `--verbose` | Enable verbose logging |
| `--json` | Output in JSON format |

## Examples

### Interactive mode

```bash
railway add
```

Prompts you to select what type of service to add.

### Add a database

```bash
railway add --database postgres
```

Add multiple databases at once:

```bash
railway add --database postgres --database redis
```

### Add from GitHub repo

```bash
railway add --repo user/my-repo
```

### Add from Docker image

```bash
railway add --image nginx:latest
```

### Create an empty service

```bash
railway add --service
```

With a specific name:

```bash
railway add --service my-api
```

### Add with environment variables

```bash
railway add --service api --variables "PORT=3000" --variables "NODE_ENV=production"
```

## Behavior

When you add a service, it's automatically linked to your current directory. For databases, the new service is automatically deployed.

## Related

- [railway service](/cli/service)
- [railway link](/cli/link)
