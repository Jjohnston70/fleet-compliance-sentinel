# Workspaces (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/projects/workspaces.md
Original Path: docs/projects/workspaces.md
Section: docs
Chunk: 1/2

---

# Workspaces

Learn how you can manage a workspaces within Railway.

Workspaces are how organizations are represented within Railway. A default workspaces is made with your account, and new ones can be created via the Pro or Enterprise plans.

For more information, visit the [documentation on pricing](/pricing) or [railway.com/pricing](https://railway.com/pricing).

## Creating a workspace

Organizations can create a workspace by heading to the [Create Workspace](https://railway.com/new/workspace) page and entering the required information.

## Managing workspaces

You can open your workspace's settings page to manage members and see billing information by clicking the gear icon next to the name of your workspace on the dashboard.

## Inviting members

Under the People tab of the settings page, you can invite members. Adding members to the workspace does not incur any additional seat cost.

There are three roles for Workspace members:

- Admin: Full administration of the Workspace and all Workspace projects
- Member: Access to all Workspace projects
- Deployer: View projects and deploy through commits to repos via GitHub integration.

|                              | Admin | Member | Deployer |
| :--------------------------- | :---: | :----: | :------: |
| Viewing workspace projects   |  ✔️   |   ✔️   |    ✔️    |
| Automatic GitHub deployments |  ✔️   |   ✔️   |    ✔️    |
| CLI deployments              |  ✔️   |   ✔️   |    ❌    |
| Creating variables           |  ✔️   |   ✔️   |    ❌    |
| Modifying variables          |  ✔️   |   ✔️   |    ❌    |
| Deleting variables           |  ✔️   |   ✔️   |    ❌    |
| Modifying service settings   |  ✔️   |   ❌   |    ❌    |
| Creating services            |  ✔️   |   ✔️   |    ❌    |
| Deleting services            |  ✔️   |   ❌   |    ❌    |
| Viewing logs                 |  ✔️   |   ✔️   |    ❌    |
| Creating volumes             |  ✔️   |   ✔️   |    ❌    |
| Deleting volumes             |  ✔️   |   ❌   |    ❌    |
| Creating new projects        |  ✔️   |   ✔️   |    ❌    |
| Deleting projects            |  ✔️   |   ❌   |    ❌    |
| Adding additional members    |  ✔️   |   ❌   |    ❌    |
| Removing members             |  ✔️   |   ❌   |    ❌    |
| Changing member roles        |  ✔️   |   ❌   |    ❌    |
| Adding trusted domains       |  ✔️   |   ❌   |    ❌    |
| Making a withdrawal          |  ✔️   |   ❌   |    ❌    |
| Accessing billing settings   |  ✔️   |   ❌   |    ❌    |
| Accessing audit logs         |  ✔️   |   ❌   |    ❌    |

_Note:_ Changes that trigger a deployment will skip the approval requirement when the author has a Deployer role (or higher) and their GitHub account is connected.

## Trusted domains

Trusted Domains let you automatically onboard new members to your workspace. When a Railway user signs up with an email address matching one of your trusted domains, they're added to your workspace with the assigned role.

For example, users signing up with `@railway.com` are automatically added to the workspace that has `railway.com` as a trusted domain.
