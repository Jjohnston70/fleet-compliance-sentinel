# Login & Tokens (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/integrations/oauth/login-and-tokens.md
Original Path: docs/integrations/oauth/login-and-tokens.md
Section: docs
Chunk: 2/2

---

### Refreshing tokens

When your access token expires (or is about to), exchange the refresh token for a new access token:

```bash
curl -X POST https://backboard.railway.com/oauth/token \
  -u "YOUR_CLIENT_ID:YOUR_CLIENT_SECRET" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=REFRESH_TOKEN"
```

```json
{
  "access_token": "...",
  "expires_in": 3600,
  "id_token": "...",
  "refresh_token": "...",
  "scope": "openid email profile offline_access",
  "token_type": "Bearer"
}
```

Refresh tokens are rotated for security. The response includes a `refresh_token` field that may initially contain the same value, but will eventually return a new token. Always store and use the refresh token from the most recent response. **Using an old, rotated token will fail, and the user would need to re-authenticate.** The new refresh token has a fresh one-year lifetime from the time of issuance.

## ID tokens

ID tokens are JSON Web Tokens (JWTs). Unlike access tokens, which are opaque and meant for API authorization, ID tokens are designed to be parsed and validated by your application to confirm who authenticated.

### Claims

The claims are not present in the ID token, but can be obtained by calling the `/oauth/me` endpoint.

```bash
curl https://backboard.railway.com/oauth/me \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

```json
{
  "sub": "user_abc123",
  "email": "user@example.com",
  "name": "Jane Developer",
  "picture": "https://avatars.githubusercontent.com/u/12345"
}
```

| Claim | Scope Required | Description |
|-------|----------------|-------------|
| `sub` | `openid` | User's unique identifier |
| `email` | `email` | User's email address |
| `name` | `profile` | User's display name |
| `picture` | `profile` | URL to user's avatar |

The `sub` claim is always present and is stable for a given user. Use it to identify returning users in your application.

## Pushed authorization requests (PAR)

Pushed Authorization Requests (PAR) are supported. This keeps authorization details out of browser history. Instead of passing all parameters in the browser redirect, you first POST them to the PAR endpoint:

```bash
curl -X POST https://backboard.railway.com/oauth/request \
  -u "YOUR_CLIENT_ID:YOUR_CLIENT_SECRET" \
  -d "redirect_uri=https://yourapp.com/callback" \
  -d "scope=openid email profile" \
  -d "response_type=code"
```

It returns a `request_uri` that references your stored parameters. Use this URI in the authorization redirect instead of the full parameter set.

```
https://backboard.railway.com/oauth/auth
  ?client_id=YOUR_CLIENT_ID
  &request_uri=urn:ietf:params:oauth:request_uri:abc123
```
