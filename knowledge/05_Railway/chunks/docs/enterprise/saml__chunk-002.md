# SAML Single Sign-On (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/enterprise/saml.md
Original Path: docs/enterprise/saml.md
Section: docs
Chunk: 2/2

---

## SSO-related events

You can receive notifications when important SSO-related events were triggered:

- **SSO Connected:** when an Identity Provider is successfully connected to the workspace.
- **SSO Disconnected:** when the Identity Provider is disconnected from the workspace.
- **SSO Updated:** when [SAML enforcement](#enforcing-saml-sso) is enabled or disabled.
- **SAML Certificate requires renewal:** when the SAML certificate is nearing expiration or has expired. This event is triggered multiple times before and after expiration.
- **SAML Certificate renewed:** when the SAML certificate is successfully renewed.
