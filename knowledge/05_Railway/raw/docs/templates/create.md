# Create a Template

Learn how to create reusable templates on Railway to enable effortless one-click deploys.

Creating a template allows you to capture your infrastructure in a reusable and distributable format.

By defining services, environment configuration, network settings, etc., you lay the foundation for others to deploy the same software stack with the click of a button.

If you [publish your template](/templates/publish-and-share) to the [marketplace](https://railway.com/templates), you can earn kickbacks from usage, up to 25% for open source templates with active community support. Learn more about the [kickback program](/templates/kickbacks).

## How to create a template

You can either create a template from scratch or base it off of an existing project.

### Starting from scratch

To create a template from scratch, head over to your [Templates](https://railway.com/workspace/templates) page within your workspace settings and click on the `New Template` button.

- Add a service by clicking the `Add New` button in the top right-hand corner, or through the command palette (`CMD + K` -> `+ New Service`)
- Select the service source (GitHub repo or Docker Image)
- Configure the service variables and settings

- Once you've added your services, click `Create Template`
- You will be taken to your templates page where you can copy the template URL to share with others

Note that your template will not be available on the template marketplace, nor will be eligible for a kickback, until you [publish](/templates/publish-and-share) it.

### Private repo support

It's now possible to specify a private GitHub repo when creating a template.

This feature is intended for use among [Workspaces](/projects/workspaces) and [Organizations](/projects/workspaces). Users supporting a subscriber base may also find this feature helpful to distribute closed-source code.

To deploy a template that includes a private repo, look for the `GitHub` panel in the `Account Integrations` section of [General Settings](https://railway.com/account). Then select the `Edit Scope` option to grant Railway access to the desired private repos.

If you do not see the `Edit Scope` option, you may still need to connect GitHub to your Railway account.

### Private Docker images

If your template includes a private Docker image, you can provide your registry credentials without exposing them to users who deploy your template.

To set this up, add a service with a Docker image source in the template editor, then enter your registry credentials in the service settings. Railway encrypts and stores these credentials securely.

When users deploy your template, Railway automatically authenticates with your registry to pull the image. Users will only see that the service uses hidden registry credentials, not the credentials themselves.

### Convert a project into a template

You can also convert an existing project into a ready-made Template for other users.

- From your project page, click `Settings` in the right-hand corner of the canvas
- Scroll down until you see **Generate Template from Project**
- Click `Create Template`

- You will be taken to the template composer page, where you should confirm the settings and finalize the template creation

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
