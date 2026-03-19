# Deploy a Phoenix App with Distillery (Chunk 2/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/phoenix-distillery.md
Original Path: guides/phoenix-distillery.md
Section: guides
Chunk: 2/6

---

### Add and configure Distillery

1. Open up the `mix.exs` file and add Distillery to the deps function:

```elixir
  defp deps do
    [ ...,
     {:distillery, "~> 2.1"},
      ...,
    ]
  end
```

Now, run `mix deps.get` to update your dependencies.

2. Open up `config/prod.exs` file and update the endpoint section to the following:

```elixir
config :helloworld_distillery, HelloworldDistilleryWeb.Endpoint,
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true,
  root: ".",
  version: Application.spec(:phoenix_distillery, :vsn)
```

`server` configures the endpoint to boot the Cowboy application http endpoint on start.
`root` configures the application root for serving static files
`version` ensures that the asset cache will be busted on versioned application upgrades.

3. Initialize your Distillery release by running the following command:

```bash
mix distillery.init
```

This will create the `rel/config.exs` and `rel/vm.args` files. A `rel/plugins` directory will be created too.

4. Create a Mix config file at `rel/config/config.exs`. Here, a mix config provider is being created. Add the following to it:

```elixir
import Config

port = String.to_integer(System.get_env("PORT") || "4000")
default_secret_key_base = :crypto.strong_rand_bytes(43) |> Base.encode64

config :helloworld_distillery, HelloworldDistilleryWeb.Endpoint,
  http: [port: port],
  url: [host: "localhost", port: port],
  secret_key_base: System.get_env("SECRET_KEY_BASE") || default_secret_key_base
```

Now, update the `rel/config.exs` file to use your new provider. In the `environment :prod` part of the file, replace with the following:

```elixir
environment :prod do
  set include_erts: true
  set include_src: false
  set cookie: :"Jo2*~U0C1x!*E}!o}W*(mx=pzd[XWG[bW)T~_Kjy3eJuEJ;M&!eqj7AUR1*9Vw]!"
  set config_providers: [
    {Distillery.Releases.Config.Providers.Elixir, ["${RELEASE_ROOT_DIR}/etc/config.exs"]}
  ]
  set overlays: [
    {:copy, "rel/config/config.exs", "etc/config.exs"}
  ]
end
```

5. Finally, let's configure Ecto to fetch the database credentials from the runtime environment variables.

Open the `lib/helloworld_distillery/repo.ex` file and modify it to this:

```elixir
defmodule HelloworldDistillery.Repo do
  use Ecto.Repo,
    otp_app: :helloworld_distillery,
    adapter: Ecto.Adapters.Postgres,
    pool_size: 10
  def init(_type, config) do
    {:ok, Keyword.put(config, :url, System.get_env("DATABASE_URL"))}
  end
end
```

### Build the release with Distillery

To build the release, run the following command:

```bash
npm run deploy --prefix assets && MIX_ENV=prod mix do phx.digest, distillery.release --env=prod
```
