# Variables Reference (Chunk 1/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/variables/reference.md
Original Path: docs/variables/reference.md
Section: docs
Chunk: 1/4

---

# Variables Reference

Reference documentation for Railway variables, including template syntax and all available system variables.

## Template syntax

Railway's templating syntax gives you flexibility in managing variables:

```plaintext
${{NAMESPACE.VAR}}
```

- `NAMESPACE` - The value for NAMESPACE is determined by the location of the variable being referenced. For a shared variable, the namespace is "shared". For a variable defined in another service, the namespace is the name of the service, e.g. "Postgres" or "backend-api".
- `VAR` - The value for VAR is the name, or key, of the variable being referenced.

You can also combine additional text or even other variables, to construct the values that you need:

```plaintext
DOMAIN=${{shared.DOMAIN}}
GRAPHQL_PATH=/v1/gql
GRAPHQL_ENDPOINT=https://${{DOMAIN}}/${{GRAPHQL_PATH}}
```

## Variable functions

[Template variable functions](/templates/create#template-variable-functions) allow you to dynamically generate variables (or parts of a variable) on demand when the template is deployed.

## Railway-provided variables

Railway provides the following additional system environment variables to all
builds and deployments.
