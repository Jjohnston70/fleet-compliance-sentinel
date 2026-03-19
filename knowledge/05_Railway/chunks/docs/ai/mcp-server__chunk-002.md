# Railway MCP Server (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/ai/mcp-server.md
Original Path: docs/ai/mcp-server.md
Section: docs
Chunk: 2/2

---

## Available MCP tools

The Railway MCP Server provides a curated set of tools. Your AI assistant will automatically call these tools based on the context of your request.

* **Status**

  * `check-railway-status` - Verify CLI installation and authentication

* **Project Management**

  * `list-projects` - List all projects
  * `create-project-and-link` - Create a project and link it to the current directory

* **Service Management**

  * `list-services` - List project services
  * `link-service` - Link a service to the current directory
  * `deploy` - Deploy a service
  * `deploy-template` - Deploy from the [Railway Template Library](https://railway.com/deploy)

* **Environment Management**

  * `create-environment` - Create a new environment
  * `link-environment` - Link environment to current directory

* **Configuration & Variables**

  * `list-variables` - List environment variables
  * `set-variables` - Set environment variables
  * `generate-domain` - Generate a Railway domain

* **Monitoring & Logs**

  * `get-logs` - Retrieve service logs

## Security considerations

Under the hood, the Railway MCP Server runs the [Railway CLI](/cli) commands. While destructive operations are intentionally excluded and not exposed as MCP tools, you should still:

* **Review actions** requested by the LLM before running them.
* **Restrict access** to ensure only trusted users can invoke the MCP server.
* **Avoid production risks** by limiting usage to local development and non-critical environments.

## Feature requests

The Railway MCP Server is a work in progress. We are actively working on adding more tools and features. If you have a feature request, leave your feedback on this [Central Station](https://station.railway.com/feedback/model-context-protocol-for-railway-railw-c040b796) post.
