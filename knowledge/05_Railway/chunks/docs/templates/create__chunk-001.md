# Create a Template (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/templates/create.md
Original Path: docs/templates/create.md
Section: docs
Chunk: 1/2

---

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
