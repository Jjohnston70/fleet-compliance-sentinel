# Using Variables (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/variables.md
Original Path: docs/variables.md
Section: docs
Chunk: 1/2

---

# Using Variables

Learn how to use variables and secrets across services on Railway.

Variables provide a way to manage configuration and secrets across services in Railway.

When defined, they are made available to your application as environment variables in the following scenarios:

- The build process for each service deployment.
- The running service deployment.
- The command invoked by `railway run `
- The local shell via `railway shell`

In Railway, there is also a notion of configuration variables which allow you to control the behavior of the platform.

_Adding, updating, or removing variables, results in a set of [staged changes](/deployments/staged-changes) that you must review and deploy, in order to apply them._

## Service variables

Variables scoped to individual services can be defined by navigating to a service's "Variables" tab.

#### Define a service variable

From a service's variables tab, click on `New Variable` to enter your variable into a form field, or use the `RAW Editor` to paste the contents of your `.env` or json-formatted file.

### Suggested variables

Your connected GitHub repository to your Service will automatically detect and suggest environment variables from `.env` files. This feature streamlines the setup process by populating your service variables at the click of a button. Railway scans the root directory of your repository for environment files and suggests their variables for import.

#### Supported .env file patterns

Railway scans for the following `.env` file patterns in your repository's root directory:

- `.env`
- `.env.example`
- `.env.local`
- `.env.production`
...
- Or any other files matching the pattern `.env.`

## Shared variables

Shared variables help reduce duplication of variables across multiple services within the same project.

#### Define a shared variable

From your Project Settings -> Shared Variables page, choose the Environment, enter the variable name and value, and click `Add`.

#### Use a shared variable

To use a shared variable, either click the Share button from the Project Settings -> Shared Variables menu and select the services with which to share, or visit the Variables tab within the service itself and click "Shared Variable".

Adding a shared variables to a service creates a [Reference Variable](/variables#referencing-a-shared-variable) in the service.

## Reference variables

Reference variables are those defined by referencing variables in other services, shared variables, or even variables in the same service.

When using reference variables, you also have access to [Railway-provided variables](#railway-provided-variables).

Railway's [template syntax](/variables/reference#template-syntax) is used when defining reference variables.

### Referencing a shared variable

Use the following syntax to reference a shared variable:

- `${{ shared.VARIABLE_KEY }}`

### Referencing another service's variable

Use the following syntax to reference variables in another service:

- `${{SERVICE_NAME.VAR}}`

### Referencing variables in the same service

Use the following syntax to reference variables in the same service:

- `${{ VARIABLE_NAME }}`

### Autocomplete dropdown

The Railway dashboard provides an autocomplete dropdown in both the name and value fields to help create reference variables.
