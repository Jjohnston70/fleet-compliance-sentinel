# Create a Template (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/templates/create.md
Original Path: docs/templates/create.md
Section: docs
Chunk: 2/2

---

## Configuring services

Configuring services using the template composer is very similar to building a live project in the canvas.

Once you add a new service and select the source, you can configure the following to enable successful deploys for template users:

- **Variables tab**
  - Add required [Variables](/variables).
    _Use [reference variables](/variables#reference-variables) where possible for a better quality template_
- **Settings tab**
  - Add a [Root Directory](/deployments/monorepo) (Helpful for monorepos)
  - [Enable Public Networking](/networking/public-networking) with TCP Proxy or HTTP
  - Set a custom [Start command](/deployments/start-command)
  - Add a [Healthcheck Path](/deployments/healthchecks#configure-the-healthcheck-path)
- **Add a volume**
  - To add a volume to a service, right-click on the service, select Attach Volume, and specify the [Volume mount path](/volumes)

### Specifying a branch

To specify a particular GitHub branch to deploy, simply enter the full URL to the desired branch in the Source Repo configuration. For example -

- This will deploy the `main` branch: `https://github.com/railwayapp-templates/postgres-ssl`
- This will deploy the `new` branch: `https://github.com/railwayapp-templates/postgres-ssl/tree/new`

### Template variable functions

Template variable functions allow you to dynamically generate variables (or parts of a variable) on demand when the template is deployed.

When a template is deployed, all template variable functions are executed and the result replaces the `${{ ... }}` in the variable.

Use template variables to generate a random password for a database, or to generate a random string for a secret.

The current template variable functions are:

1. `secret(length?: number, alphabet?: string)`: Generates a random secret (32 chars by default).

   **Tip:** You can generate Hex or Base64 secrets by constructing the appropriate alphabet and length.

   - `openssl rand -base64 16` →

     ```text
     ${{secret(22, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/")}}==
     ```

   - `openssl rand -base64 32` →

     ```text
     ${{secret(43, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/")}}=
     ```

   - `openssl rand -base64 64` →

     ```text
     ${{secret(86, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/")}}==
     ```
   - `openssl rand -hex 16` →

     ```text
     ${{secret(32, "abcdef0123456789")}}
     ```

   - `openssl rand -hex 32` →

     ```text
     ${{secret(64, "abcdef0123456789")}}
     ```

   - `openssl rand -hex 64` →

     ```text
     ${{secret(128, "abcdef0123456789")}}
     ```

   Or even generate a UUIDv4 string -

   ```text
   ${{secret(8, "0123456789abcdef")}}-${{secret(4, "0123456789abcdef")}}-4${{secret(3, "0123456789abcdef")}}-${{secret(1, "89ab")}}${{secret(3, "0123456789abcdef")}}-${{secret(12, "0123456789abcdef")}}
   ```

2. `randomInt(min?: number, max?: number)`: Generates a random integer between min and max (defaults to 0 and 100)

## Managing your templates

You can see all of your templates on your [Workspace's Template page](https://railway.com/workspace/templates). Templates are separated into Personal and Published templates.

You can edit, publish/unpublish and delete templates.
