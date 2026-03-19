# Creating an App (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/integrations/oauth/creating-an-app.md
Original Path: docs/integrations/oauth/creating-an-app.md
Section: docs
Chunk: 2/2

---

## PKCE (proof key for Code exchange)

PKCE adds a layer of protection to the authorization code flow. Without PKCE, an attacker who intercepts an authorization code could potentially exchange it for tokens. With PKCE, they would also need the code verifier: a secret that never travels through the redirect.

Add the code challenge to your authorization request:

```
https://backboard.railway.com/oauth/auth
  ?response_type=code
  &client_id=YOUR_CLIENT_ID
  &redirect_uri=https://yourapp.com/callback
  &scope=openid
  &code_challenge=CODE_CHALLENGE
  &code_challenge_method=S256
```

When exchanging the authorization code for tokens, include the original code verifier:

```bash
curl -X POST https://backboard.railway.com/oauth/token \
  -u "YOUR_CLIENT_ID:YOUR_CLIENT_SECRET" \
  -d "grant_type=authorization_code" \
  -d "code=AUTHORIZATION_CODE" \
  -d "redirect_uri=https://yourapp.com/callback" \
  -d "code_verifier=CODE_VERIFIER"
```

## Dynamic client registration

OAuth 2.0 Dynamic Client Registration is supported, allowing applications to register OAuth clients programmatically rather than through the UI. This is useful for development tools that need to bootstrap OAuth configuration.

### Endpoint

```
POST https://backboard.railway.com/oauth/register
```

Dynamic registration requests are subject to rate limits to prevent abuse.

### Managing dynamic clients

Clients created through dynamic registration are managed exclusively through the Dynamic Client Registration Management API. They don't appear in the workspace settings UI. When you register a client, the response includes a registration access token. Use this token to update or delete the client later.

Store the registration access token securely alongside your client credentials. Without it, you cannot modify or delete the dynamically registered client.
