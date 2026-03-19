# Deploy a Phoenix App (Chunk 2/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/phoenix.md
Original Path: guides/phoenix.md
Section: guides
Chunk: 2/4

---

# nixpacks.toml
[variables]
MIX_ENV = 'prod'

[phases.setup]
nixPkgs = ['...', 'erlang']

[phases.install]
cmds = [
  'mix local.hex --force',
  'mix local.rebar --force',
  'mix deps.get --only prod'
]

[phases.build]
cmds = [
  'mix compile',
  'mix assets.deploy'
]

[start]
cmd = "mix ecto.setup && mix phx.server"
```

1. `[variables]` This section contains the list of env variables you want to set for the app.
   - `MIX_ENV = 'prod'`: It sets the Elixir environment to prod.
2. `[phases.setup]`: This defines a list of Nix packages to be installed during the setup phase. The placeholder `'...'` should be replaced with any additional packages needed for your application. The inclusion of erlang indicates that the Erlang runtime is required for the Elixir application.
3. `[phases.install]`: This section contains a list of commands to run during the installation phase.
   - `mix local.hex --force`: Installs the Hex package manager for Elixir, which is necessary for managing dependencies.
   - `mix local.rebar --force`: Installs Rebar, a build tool for Erlang.
   - `mix deps.get --only prod`: Fetches only the production dependencies defined in the `mix.exs` file.
4. `[phases.build]`: This section contains commands to run during the build phase.
   - `mix compile`: Compiles the Elixir application.
   - `mix assets.deploy`: This is a command to handle the deployment of static assets (e.g., JavaScript, CSS) for your app.
5. `[start]`: This section contains commands to run when starting the application.
   - `mix ecto.setup`: This command is used to set up the database by running migrations and seeding it. It prepares the database for the application to connect.
   - `mix phx.server`: This starts the Phoenix server, allowing the application to begin accepting requests.

Now you're ready to deploy!

## Deploy Phoenix app to Railway

Railway offers multiple ways to deploy your Phoenix app, depending on your setup and preference. Choose any of the following methods:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [Using the CLI](#deploy-from-the-cli).
3. [From a GitHub repository](#deploy-from-a-github-repo).

## One-click deploy from a template

If you’re looking for the fastest way to get started, the one-click deploy option is ideal. It sets up a Phoenix app along with a Postgres database.

Click the button below to begin:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/0LSBzw)

After deploying, it is recommended that you [eject from the template](/templates/deploy#eject-from-template-repository) to create a copy of the repository under your own GitHub account. This will give you full control over the source code and project.
