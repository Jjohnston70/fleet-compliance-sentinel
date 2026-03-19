# Public API (Chunk 2/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/integrations/api.md
Original Path: docs/integrations/api.md
Section: docs
Chunk: 2/4

---

#### Using an account token

You can try the query below in the terminal of your choice. It should return your name and email on Railway:

```bash
curl --request POST \
  --url https://backboard.railway.com/graphql/v2 \
  --header 'Authorization: Bearer ' \
  --header 'Content-Type: application/json' \
  --data '{"query":"query { me { name email } }"}'
```

**Note:** This query **cannot** be used with a workspace or project token because the data returned is scoped to your personal account.

#### Using a workspace token

If you have a workspace token, you can use it to authenticate requests scoped to that workspace. The query below should return the workspace name and ID:

```bash
curl --request POST \
  --url https://backboard.railway.com/graphql/v2 \
  --header 'Authorization: Bearer ' \
  --header 'Content-Type: application/json' \
  --data '{"query":"query { workspace(workspaceId: \"\") { name id } }"}'
```

**Note:** This query **can** also be used with an account token as long as you are a member of the workspace.

#### Using a project token

If you have a project token, you can use it to authenticate requests to a specific environment within a project. The query below should return the project and environment IDs:

```bash
curl --request POST \
  --url https://backboard.railway.com/graphql/v2 \
  --header 'Project-Access-Token: ' \
  --header 'Content-Type: application/json' \
  --data '{"query":"query { projectToken { projectId environmentId } }"}'
```

**Note:** Project tokens use the `Project-Access-Token` header, not the `Authorization: Bearer` header used by account, workspace, and OAuth tokens.

## Viewing the schema

The Railway API supports introspection meaning you can use popular tools like [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/) to connect to the API and query the schema. Simply set up your connection with the endpoint and Authorization token, and fetch the schema.

### API collection file

We also provide a collection file which can be imported into your preferred API client. Click [here](https://gql-collection-server.up.railway.app/railway_graphql_collection.json) to download it.

Once imported, you should only need to add your API token to get connected and start executing queries in the collection.

### GraphiQL playground

Alternatively, you can use the [GraphiQL playground](https://railway.com/graphiql) to view the schema and test your queries.

Make sure to set an Authorization header with an auth token. Click the "Headers" tab at the bottom of the GraphiQL page and enter this json, using your own token:

```json
{ "Authorization": "Bearer " }
```
