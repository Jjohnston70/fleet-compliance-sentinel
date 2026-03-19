# Deploy a Phoenix App with Distillery (Chunk 4/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/phoenix-distillery.md
Original Path: guides/phoenix-distillery.md
Section: guides
Chunk: 4/6

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
  'mkdir -p _build/prod/rel/helloworld_distillery/releases/RELEASES',
  'mix do phx.digest, distillery.release --env=prod',
]

[start]
cmd = "mix ecto.setup && _build/prod/rel/helloworld_distillery/bin/helloworld_distillery foreground"
```

This [`nixpacks.toml` file](/config-as-code/reference#nixpacks-config-path) instructs Railway to execute specific commands during the setup, install, build, and start phases of the deployment. It ensures your app is compiled, assets are digested, and the release is created correctly using Distillery.

## Deploy Phoenix app to Railway

Railway offers multiple ways to deploy your Phoenix app, depending on your setup and preference. Choose any of the following methods:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [Using the CLI](#deploy-from-the-cli).
3. [From a GitHub repository](#deploy-from-a-github-repo).

## One-click deploy from a template

If you’re looking for the fastest way to get started, the one-click deploy option is ideal. It sets up a Phoenix app with Distillery along with a Postgres database.

Click the button below to begin:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/_qWFnI)

After deploying, it is recommended that you [eject from the template](/templates/deploy#eject-from-template-repository) to create a copy of the repository under your own GitHub account. This will give you full control over the source code and project.
