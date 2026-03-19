# Deploy a Scala Play App (Chunk 1/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/play.md
Original Path: guides/play.md
Section: guides
Chunk: 1/5

---

# Deploy a Scala Play App

Learn how to deploy a Scala Play app to Railway with this step-by-step guide. It covers quick setup, database integration, one-click deploys and other deployment strategies.

[Play](https://www.playframework.com) is a high velocity and productive web framework for Java and Scala. It is based on a lightweight, stateless, web-friendly architecture and features predictable and minimal resource consumption (CPU, memory, threads) for highly-scalable applications thanks to its reactive model, based on Pekko Streams.

This guide covers how to deploy a Scala Play app to Railway in four ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [From a GitHub repository](#deploy-from-a-github-repo).
3. [Using the CLI](#deploy-from-the-cli).
4. [Using a Dockerfile](#use-a-dockerfile).

Now, let's create a Play app!

## Create a Play app

**Note:** If you already have a Play app locally or on GitHub, you can skip this step and go straight to the [Deploy Play App to Railway](#deploy-the-play-app-to-railway).

To create a new Scala Play app, ensure that you have [JDK](https://www.oracle.com/java/technologies/downloads/) and [sbt](https://www.scala-sbt.org/download/) installed on your machine.

Run the following command in your terminal to create a new Play app:

```bash
sbt new
```

A list of templates will be shown to select from. Select the `playframework/play-scala-seed.g8` template.

- Give it a name, `helloworld`.
- Give it an organization name, `com.railwayguide`
- Hit Enter for the rest to use the latest versions of play, scala and sbt scaffold.

A new Scala Play app will be provisioned in the `helloworld` directory.

### Modify Scala Play views and set up database config

_Step 1_ : Modify the Index File

Open the project in your editor. Head over to the `app/views/index.scala.html` file.

Modify it to the following:

```scala
@()

@main("Welcome to Play") {
  Welcome to Play!
  Hello World, Railway!
}
```

This change adds a new heading, which you'll see when you run the app locally.

_Step 2_ : Run the App Locally

- Now, let’s run the app locally to verify your changes. You should see the new headers appear in the browser.

_Step 3_ : Add PostgreSQL Driver as a Dependency

Play doesn’t provide built-in database drivers, so you need to add the PostgreSQL JDBC driver manually to your project.

In your `build.sbt`, add the following dependency:

```scala
libraryDependencies += "org.postgresql" % "postgresql" % "42.7.4" // Always use the latest stable version
```

_Step 4_ : Configure PostgreSQL in application.conf

Next, configure the PostgreSQL database connection in `conf/application.conf`:

```scala
