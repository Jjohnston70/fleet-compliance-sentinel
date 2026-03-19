# Deploy a Phoenix App with Distillery (Chunk 1/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/phoenix-distillery.md
Original Path: guides/phoenix-distillery.md
Section: guides
Chunk: 1/6

---

# Deploy a Phoenix App with Distillery

Learn how to deploy a Phoneix app with Distillery to Railway with this step-by-step guide. It covers quick setup, ecto setup, database integration, one-click deploys and other deployment strategies.

[Phoenix](https://phoenixframework.org) is popular Elixir framework designed for building scalable, maintainable, and high-performance web applications. It is known for its ability to handle real-time features efficiently, like WebSockets, while leveraging Elixir's concurrency model, which is built on the Erlang Virtual Machine (BEAM).

In this guide, you'll learn how to deploy Phoenix apps with [Distillery](https://hexdocs.pm/distillery/home.html) to Railway.

## Create a Phoenix app with Distillery

**Note:** If you already have a Phoenix app locally or on GitHub, you can skip this step and go straight to the [Deploy Phoenix App with Distillery to Railway](#deploy-phoenix-app-on-railway).

To create a new Phoenix app, ensure that you have [Elixir](https://elixir-lang.org/install.html) and [Hex package manager](https://hexdocs.pm/phoenix/installation.html) installed on your machine. Once everything is set up, run the following command in your terminal to install the Phoenix application generator:

```bash
mix archive.install hex phx_new
```

Next, run the following command:

```bash
mix phx.new helloworld_distillery
```

Select `Y` to install all dependencies.

This command will create a new Phoenix app named `helloworld_distillery` with some optional dependencies such as:

- [Ecto](https://hexdocs.pm/phoenix/ecto.html) for communicating with a database such as PostgreSQL, MySQL etc
- [Phoenix live view](https://hexdocs.pm/phoenix_live_view) for building realtime & interactive web apps.
- [Phoenix HTML and Tailwind CSS](https://hexdocs.pm/phoenix_html/Phoenix.HTML.html) for HTML apps.

### Configure database

Next, navigate into the `helloworld` directory using the `cd` command.

Open up the `config/dev.exs` file. You'll notice that a new Phoenix app is already set up with PostgreSQL settings. It assumes the database has a `postgres` user with the right permissions and a default password of `postgres`. Update the username and password to match your local PostgreSQL account credentials.

**Note**: If you prefer using a different database, like MySQL, you can easily switch the database adapter in the `mix.exs` file. Simply remove the `Postgrex` dependency and add `MyXQL` instead. For detailed instructions, check out this [guide on using other databases](https://hexdocs.pm/phoenix/ecto.html#using-other-databases) in Phoenix.

The default database name is set to `helloworld_dev`, but feel free to change it to whatever you'd prefer.

Next, create the database for your app by running the following command:

```bash
mix ecto.create
```

A database will be created for your app.
