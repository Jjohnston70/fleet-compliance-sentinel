# Troubleshooting (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/integrations/oauth/troubleshooting.md
Original Path: docs/integrations/oauth/troubleshooting.md
Section: docs
Chunk: 2/2

---

## Too many refresh tokens

Each user authorization can have a maximum of 100 refresh tokens. If your application requests more than 100 refresh tokens for the same user (for example, by repeatedly going through the full OAuth flow instead of using existing refresh tokens), the oldest tokens are revoked automatically without notice.

## Access token expired

Access tokens last one hour. If API requests start failing with authentication errors, check whether the token has expired. Use your refresh token to obtain a new access token, or if you don't have a refresh token, redirect the user through the OAuth flow again.

## Workspace query returns not authorized

When querying workspaces with a workspace scope, you must also have the `email` and `profile` scopes. Without them, the API cannot resolve workspace membership, and the query returns an empty array.

Ensure your authorization request includes all three:

```
&scope=openid email profile workspace:viewer
```

## ID token missing claims

ID tokens do not include user claims like `email`, `name`, or `picture`. To retrieve these, call the `/oauth/me` endpoint with your access token:

```bash
curl https://backboard.railway.com/oauth/me \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

The claims returned depend on which scopes were approved (`email` for email, `profile` for name and picture).
