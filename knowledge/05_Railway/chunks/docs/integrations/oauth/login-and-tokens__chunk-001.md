# Login & Tokens (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/integrations/oauth/login-and-tokens.md
Original Path: docs/integrations/oauth/login-and-tokens.md
Section: docs
Chunk: 1/2

---

# Login & Tokens

Understand the OAuth authorization flow and token lifecycle.

Login with Railway implements the OAuth 2.0 Authorization Code flow with OpenID Connect.

## Initiating login

Redirect the user to the authorization endpoint:

```
GET https://backboard.railway.com/oauth/auth
```

| Parameter | Required | Description |
|-----------|----------|-------------|
| `response_type` | Yes | Must be `code` |
| `client_id` | Yes | Your OAuth app's client ID |
| `redirect_uri` | Yes | Must exactly match a registered URI |
| `scope` | Yes | Space-separated scopes (`openid` required) |
| `state` | Recommended | Random string for CSRF protection |
| `code_challenge` | Native Apps: Required, Web Apps: Recommended | PKCE challenge |
| `code_challenge_method` | With PKCE | Must be `S256` |
| `prompt` | No | Set to `consent` to force consent screen |

### Authorization response

If the user approves your application, they are redirected to your redirect URI with an authorization code:

```
https://yourapp.com/callback?code=AUTHORIZATION_CODE&state=abc123
```

The code is short-lived and single-use. Exchange it for tokens immediately. If the user denies access, the redirect includes an `error` parameter instead.

```bash
curl -X POST https://backboard.railway.com/oauth/token \
  -u "YOUR_CLIENT_ID:YOUR_CLIENT_SECRET" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=AUTHORIZATION_CODE" \
  -d "redirect_uri=https://yourapp.com/callback"
```

Response:

```json
{
  "access_token": "...",
  "expires_in": 3600,
  "id_token": "...",
  "scope": "openid email profile",
  "token_type": "Bearer"
}
```

## Access tokens

Access tokens authenticate your application's requests to Railway's API. When you call the [Public API](/integrations/api), include the access token in the Authorization header:

```bash
curl -X POST https://backboard.railway.com/graphql/v2 \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { me { name email } }"}'
```

## Refresh tokens

Access tokens expire after one hour. For applications that need longer-lived access (background jobs, scheduled tasks, or simply avoiding frequent re-authentication) refresh tokens provide a way to obtain new access tokens without user interaction.

### Obtaining refresh tokens

To receive a refresh token, your authorization request must include both the `offline_access` scope and the `prompt=consent` parameter:

```
https://backboard.railway.com/oauth/auth
  ?response_type=code
  &client_id=YOUR_CLIENT_ID
  &redirect_uri=https://yourapp.com/callback
  &scope=openid+offline_access
  &prompt=consent
```

The `prompt=consent` ensures the user sees the consent screen, which is required for granting offline access. Without it, returning users might skip consent through automatic approval, and no refresh token would be issued.

Response:

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
