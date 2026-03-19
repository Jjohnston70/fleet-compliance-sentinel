# Deploy a Phoenix App (Chunk 1/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/phoenix.md
Original Path: guides/phoenix.md
Section: guides
Chunk: 1/4

---

# Deploy a Phoenix App

Learn how to deploy a Phoenix app to Railway with this step-by-step guide. It covers quick setup, ecto setup, database integration, one-click deploys and other deployment strategies.

[Phoenix](https://phoenixframework.org) is popular Elixir framework designed for building scalable, maintainable, and high-performance web applications. It is known for its ability to handle real-time features efficiently, like WebSockets, while leveraging Elixir's concurrency model, which is built on the Erlang Virtual Machine (BEAM).

## Create a Phoenix app

**Note:** If you already have a Phoenix app locally or on GitHub, you can skip this step and go straight to the [Deploy Phoenix App on Railway](#deploy-phoenix-app-on-railway).

To create a new Phoenix app, ensure that you have [Elixir](https://elixir-lang.org/install.html) and [Hex package manager](https://hexdocs.pm/phoenix/installation.html) installed on your machine. Once everything is set up, run the following command in your terminal to install the Phoenix application generator:

```bash
mix archive.install hex phx_new
```

Next, run the following command:

```bash
mix phx.new helloworld
```

Select `Y` to install all dependencies.

This command will create a new Phoenix app named `helloworld` with some optional dependencies such as:

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

### Run the Phoenix app locally

Start the app by running the following command:

```bash
mix phx.server
```

By default, Phoenix accepts requests on port `4000`.

Open your browser and go to `http://localhost:4000` to see your app.

Now that your app is running locally, let’s move on to deploying it to Railway!

### Prepare your Phoenix app for deployment

Go ahead and create a `nixpacks.toml` file in the root directory of your Phoenix app.

The [nixpacks.toml file](https://nixpacks.com/docs/configuration/file) is a configuration file used by Nixpacks, a build system developed and used by Railway, to set up and deploy applications.

In this file, you can specify the instructions for various build and deployment phases, along with environment variables and package dependencies.

Add the following content to the file:

```toml
