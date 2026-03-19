# SAML Single Sign-On (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/enterprise/saml.md
Original Path: docs/enterprise/saml.md
Section: docs
Chunk: 1/2

---

# SAML Single Sign-On

Learn about how to configure and use SAML Single Sign-On (SSO) for your Railway workspace.

**SAML Single Sign-On (SSO)** allows workspace members to sign in using your organization’s Identity Provider (IdP), including Okta, Auth0, Microsoft Entra ID, Google Workspace, and more.

New users signing in with your Identity Provider are automatically added to your workspace as [workspace members](/projects/workspaces#managing-workspaces).

## Configuring SAML SSO

To configure SAML SSO, go to your workspace’s [People settings](https://railway.com/workspace/people). You must be a workspace admin with access to your Identity Provider’s configuration panel.

1. Add your organization’s email domain(s) as [**Trusted Domains**](/projects/workspaces#trusted-domains).
2. In the **SAML Single Sign-On** section, click **Configure** and follow the guided setup to connect your Identity Provider to Railway.
3. Optionally, [enforce SAML SSO](#enforcing-saml-sso) to require members to log in through your Identity Provider.

Once configured, users can [login using SAML SSO](#login-using-sso) using their organization email. Existing users must update their Railway email if it differs from their Identity Provider email.

_If you’re a Railway Enterprise customer and don’t see the SAML settings in your workspace, please contact us._

## Enforcing SAML SSO

Workspace admins can **enforce SAML SSO** to ensure all members access the workspace with your Identity Provider.

- **Enable enforcement** by toggling "Members need to login with SAML SSO."
- Only workspace admins already logged in with SAML SSO can enable enforcement.
- When enforcement is active, users not authenticated with SAML SSO can’t open the workspace or access its resources.
- Enforcement takes effect immediately. Active users without SAML authentication will be prompted to re-authenticate.

Note: Enforcement will not limit which login methods a user can use. Because Railway users can be members of multiple workspaces, they can still log in with other methods, but must use SAML SSO to access the SAML-enforced workspace.

## Login using SSO

After SAML SSO is enabled, users can log in using their organization’s email by selecting _"Log in using Email"_ → _"Log in using SSO"_.

Alternatively, go directly to https://railway.com/login#login-saml.

Railway also supports IdP-initiated SSO, allowing users to access Railway directly from their Identity Provider’s dashboard.

## Supported identity providers

We support all identity providers that use **SAML** or **OIDC**, including:

- Okta
- Microsoft Entra ID (Azure AD)
- Auth0
- Google
- JumpCloud
- ADP
- CAS
- ClassLink
- Cloudflare
- Ping Identity
- CyberArk
- Duo
- Keycloak
- LastPass
- Login.gov
- miniOrange
- NetIQ
- OneLogin
- Oracle
- Rippling
- Salesforce
- Shibboleth
- SimpleSAMLphp
- VMware Workspace

and any other provider compatible with **SAML** or **OIDC**.
