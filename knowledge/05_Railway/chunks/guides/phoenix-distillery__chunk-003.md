# Deploy a Phoenix App with Distillery (Chunk 3/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/phoenix-distillery.md
Original Path: guides/phoenix-distillery.md
Section: guides
Chunk: 3/6

---

#### Handling errors

If you encounter the following error after running the command:

```bash
==> Invalid application `:sasl`! The file sasl.app does not exist or cannot be loaded.
```

You need to modify your `mix.exs` file to include `:sasl`. Open the file and add `:sasl` to the `extra_applications` list in the `application` function:

```elixir
def application do
    [
      mod: {HelloworldDistillery.Application, []},
      extra_applications: [:logger, :runtime_tools, :sasl]
    ]
  end
```

After saving your changes, try running the command again as a super user to prevent access errors:

```bash
sudo npm run deploy --prefix assets && MIX_ENV=prod mix do phx.digest, distillery.release --env=prod
```

**Additional Errors**

If you encounter this error:

```bash
Failed to archive release: _build/prod/rel/helloworld_distillery/releases/RELEASES: no such file or directory
```

You’ll need to create the `RELEASES` directory manually. Once created, run the command again.

#### Successful build

Upon a successful build, you should see output similar to the following:

```bash
...
==> Packaging release..
Release successfully built!
To start the release you have built, you can use one of the following tasks:

    # start a shell, like 'iex -S mix'
    > _build/prod/rel/helloworld_distillery/bin/helloworld_distillery console

    # start in the foreground, like 'mix run --no-halt'
    > _build/prod/rel/helloworld_distillery/bin/helloworld_distillery foreground

    # start in the background, must be stopped with the 'stop' command
    > _build/prod/rel/helloworld_distillery/bin/helloworld_distillery start

If you started a release elsewhere, and wish to connect to it:

    # connects a local shell to the running node
    > _build/prod/rel/helloworld_distillery/bin/helloworld_distillery remote_console

    # connects directly to the running node's console
    > _build/prod/rel/helloworld_distillery/bin/helloworld_distillery attach

For a complete listing of commands and their use:

    > _build/prod/rel/helloworld_distillery/bin/helloworld_distillery help
```

### Test the release with Distillery locally

Now, test your release locally. First, create your database by running the following command:

```bash
mix ecto.create
```

Next, export the necessary environment variables by running:

```bash
```

With the environment set up, you can start the release with:

```bash
_build/prod/rel/helloworld_distillery/bin/helloworld_distillery foreground
```

Once your app is running, open your browser and visit `http://localhost:4000` to see it in action.

With your app up and running locally, let's move on to deploying the release to Railway!

### Prepare app for deployment

Create a `nixpacks.toml` file in the root of your app directory and add the following content:

```toml
