# Deploy a Clojure Luminus App (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/luminus.md
Original Path: guides/luminus.md
Section: guides
Chunk: 1/3

---

# Deploy a Clojure Luminus App

Learn how to deploy your Clojure Luminus app to Railway with this step-by-step guide. It covers quick setup, database integration, one-click deploys and other deployment strategies.

[Luminus](https://luminusweb.com) is a Clojure micro-framework based on a set of lightweight libraries. It aims to provide a robust, scalable, and easy to use platform. With Luminus you can focus on developing your app the way you want without any distractions.

This guide covers how to deploy a Luminus app to Railway in four ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [From a GitHub repository](#deploy-from-a-github-repo).
3. [Using the CLI](#deploy-from-the-cli).
4. [Using a Dockerfile](#use-a-dockerfile).

Now, let's create a Luminus app!

## Create a Luminus app

**Note:** If you already have a Luminus app locally or on GitHub, you can skip this step and go straight to the [Deploy Luminus App to Railway](#deploy-luminus-app-to-railway).

To create a new Luminus app, ensure that you have [JDK](https://www.oracle.com/java/technologies/downloads/) and [Leiningen](https://leiningen.org/#install) installed on your machine.

Run the following command in your terminal to create a new Luminus app with Postgres and a production ready server:

```bash
lein new luminus helloworld +postgres +immutant
```

A new Luminus app will be provisioned for you in the `helloworld` directory with support for PostgreSQL as the database and configures [Immutant](https://github.com/immutant/immutant) as the web server, which is production-ready and optimized for Clojure applications.

**Note:** If you use MySQL or another database, you can pass it as an option when trying to create a new app.

### Run the Luminus app locally

Open `dev-config.edn` and add your Postgres database URL like so:

```clojure
 :database-url "postgresql://username:password@127.0.0.1:5432/helloworld_dev"
```

- `username:password` is your database user and password.
- `helloworld_dev` is the database you have created locally.

Next, run `lein run migrate` to run the database migrations.

Finally, run `lein run` to launch your app!

Open your browser and go to `http://localhost:3000` to see the app.

### Prepare Clojure Luminus app for deployment

1. Add the `cheshire` library to your dependencies. `cheshire` is a popular JSON encoding/decoding library in Clojure.

Open your `project.clj` file and ensure you have the following under `:dependencies`:

```clojure
...
[cheshire "5.10.0"]
```

Run the command below in your terminal to ensure it is installed:

```bash
lein deps
```

2. Create a `nixpacks.toml` file in the root directory of the app.

The [nixpacks.toml file](https://nixpacks.com/docs/configuration/file) is a configuration file used by Nixpacks, a build system developed and used by Railway, to set up and deploy applications.

In this file, you can specify the instructions for various build and deployment phases, along with environment variables and package dependencies.

Add the following content to the file:

```toml
