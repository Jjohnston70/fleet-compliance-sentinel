Title: Using Variables
Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/variables.md
Original Path: docs/variables.md
Section: docs

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

## Sealed variables

Railway provides the ability to seal variable values for extra security. When a variable is sealed, its value is provided to builds and deployments but is never visible in the UI nor can it be retrieved via the API.

### Sealing a variable

To seal an existing variable, click the 3-dot menu on the right-side of the variable and choose the "Seal" option.

### Updating a sealed variable

Sealed variables can be updated by clicking the edit option in the 3-dot menu just like normal variables but they cannot be updated via the Raw Editor.

### Caveats

Sealed variables are a security-first feature and with that come some constraints:

- Sealed variables cannot be un-sealed.
- Sealed variable values are not provided when using `railway variables` or `railway run` via the CLI.
- Sealed variables are not copied over when creating PR environments.
- Sealed variables are not copied when duplicating an environment.
- Sealed variables are not copied when duplicating a service.
- Sealed variables are not shown as part of the diff when syncing environment changes.
- Sealed variables are not synced with external integrations.

## Railway-provided variables

Railway provides many variables to help with development operations. Some of the commonly used variables include -

- `RAILWAY_PUBLIC_DOMAIN`
- `RAILWAY_PRIVATE_DOMAIN`
- `RAILWAY_TCP_PROXY_PORT`

For an exhaustive list, please check out the [Variables Reference](/variables/reference#railway-provided-variables) page.

## Multiline variables

Variables can span multiple lines. Press `Control + Enter` (`Cmd + Enter` on Mac) in the variable value input field to add a newline, or simply type a newline in the Raw Editor.

## Using variables in your services

Variables are made available at runtime as environment variables. To use them in your application, simply use the interface appropriate for your language to retrieve environment variables.

For example, in a node app -

```node
process.env.VARIABLE_NAME;
```

#### Local development

Using the Railway CLI, you can run your code locally with the environment variables configured in your Railway project.

- Ensure that you have the Railway CLI installed and linked to your project
- In your terminal, execute `railway run `
  -> for example, `railway run npm run dev`

Check out the [CLI guide](/cli#local-development) for more information on using the CLI.

## Using variables in your Dockerfile

For information on how to use variables in your Dockerfile refer to the [Dockerfiles guide](/builds/dockerfiles#using-variables-at-build-time).

## Import variables from Heroku

You can import variables from an existing Heroku app using the command palette
on the service variables page. After connecting your Heroku account you can
select any of your Heroku apps and the config variables will be added to the current service and environment.

## Using doppler for secrets management

The Doppler team maintains an integration that enables you to sync your secrets in Doppler to your project(s) in Railway.

You can get instructions on how to use Doppler with Railway on the Doppler Docs
integration.
