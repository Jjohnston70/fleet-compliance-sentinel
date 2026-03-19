# Creating an App (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/integrations/oauth/creating-an-app.md
Original Path: docs/integrations/oauth/creating-an-app.md
Section: docs
Chunk: 1/2

---

# Creating an App

Create and configure OAuth applications for Login with Railway.

OAuth apps are created within a workspace and allow your application to authenticate users with their Railway account. Only **workspace admins** can create and manage apps. Before implementing the OAuth flow, you need to register your app to obtain client credentials and configure how it interacts with the authorization server.

## App types

Two types of OAuth applications are supported:

| Type | Client Secret | PKCE | Auth Method |
|------|---------------|------|-------------|
| Web (Confidential) | Required | Recommended | `client_secret_basic` or `client_secret_post` |
| Native (Public) | None | Required | `none` |

### Web applications

Web applications are confidential clients. They run on servers you control, where a client secret can be stored securely.

Even though web apps have a client secret, implementing PKCE is strongly recommended. PKCE protects against authorization code interception if an attacker manages to observe the redirect.

### Native applications

Native applications include mobile apps, desktop applications, command-line tools, and single-page applications running entirely in the browser. These are public clients because any secrets embedded in them could be extracted by users or attackers. You cannot trust that a secret will remain confidential.

Native apps authenticate using PKCE exclusively. Do not send a client secret, otherwise the token request will fail.

## Creating an app

To register a new OAuth app, go to your workspace settings, navigate to **Developer**, and click **New OAuth App**. Enter a name that users will recognize on the consent screen, add your redirect URI(s), and select the appropriate app type.

For web applications, a client secret is generated after creation. Copy this immediately. It's displayed only once. Store it securely in your application's configuration, such as an environment variable or secrets manager. Never commit it to version control.

## Redirect URIs

Redirect URIs specify where users are sent after they authorize (or deny) your application. You can register multiple URIs to support different environments. For example, `http://localhost:3000/callback` for local development and `https://yourapp.com/callback` for production.

When initiating authorization, the `redirect_uri` parameter must exactly match one of your registered URIs. This includes the scheme, host, port, and path. If they don't match, the authorization request fails with an `invalid_redirect_uri` error.
