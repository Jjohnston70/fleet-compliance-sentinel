# Public API (Chunk 1/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/integrations/api.md
Original Path: docs/integrations/api.md
Section: docs
Chunk: 1/4

---

# Public API

Discover the Railway GraphQL Public API.

The Railway public API is built with GraphQL and is the same API that powers the Railway dashboard.

Use the Public API to integrate Railway into your CI/CD pipelines and other workflows.

## Understanding GraphQL

New to GraphQL? Start with the [Introduction to GraphQL](/integrations/api/graphql-overview) guide, which explains the core concepts using Railway's API.

For deeper learning, these external resources are helpful:
- [Official Introduction to GraphQL](https://graphql.org/learn/)
- [GraphQL Basics](https://hasura.io/learn/graphql/intro-graphql/introduction/) course by Hasura
- [GraphQL is the better REST](https://www.howtographql.com/basics/1-graphql-is-the-better-rest/)

## Connecting to the public API

To connect to and query the Public API, you will need the endpoint URL and a token for authentication.

### Endpoint

The public API is accessible at the following endpoint:

```bash
https://backboard.railway.com/graphql/v2
```

### Creating a token

To use the API, you will need an API token. There are three types of tokens you can create in the Railway dashboard. If you're building an application that authenticates users, you can also use OAuth.

#### Choosing a token type

| Token Type | Scope | Best For |
|------------|-------|----------|
| Account token | All your resources and workspaces | Personal scripts, local development |
| Workspace token | Single workspace | Team CI/CD, shared automation |
| Project token | Single environment in a project | Deployments, service-specific automation |
| OAuth | User-granted permissions | Third-party apps acting on behalf of users |

#### Account tokens and workspace tokens

You can create an account or workspace token from the [tokens page](https://railway.com/account/tokens) in your account settings.

- **Account token** - If you select "No workspace", the token will be tied to your Railway account. This is the broadest scope. The token can perform any API action you're authorized to do across all your resources and workspaces. Do not share this token with anyone else.
- **Workspace token** - Select a specific workspace in the dropdown to create a token scoped to that workspace. A workspace token has access to all the workspace's resources, and cannot be used to access your personal resources or other workspaces on Railway. You can share this token with your teammates.

#### Project token

You can create a project token from the tokens page in your project settings.

Project tokens are scoped to a specific environment within a project and can only be used to authenticate requests to that environment.

#### OAuth access token

If you're building an application that acts on behalf of users, you can use [Login with Railway](/integrations/oauth) to obtain an access token through the OAuth flow. The token's permissions depend on the scopes the user approved.

### Execute a test query

Once you have your token, you can pass it within the Authorization header of your request.
