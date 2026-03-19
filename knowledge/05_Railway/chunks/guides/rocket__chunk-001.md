# Deploy a Rust Rocket App (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/rocket.md
Original Path: guides/rocket.md
Section: guides
Chunk: 1/3

---

# Deploy a Rust Rocket App

Learn how to deploy a Rust Rocket app to Railway with this step-by-step guide. It covers quick setup, one-click deploys, Dockerfile and other deployment strategies.

[Rocket](https://rocket.rs) is a web framework for Rust that makes it simple to write fast, type-safe, secure web applications with incredible usability, productivity and performance.

This guide covers how to deploy a Rocket app to Railway in four ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [From a GitHub repository](#deploy-from-a-github-repo).
3. [Using the CLI](#deploy-from-the-cli).
4. [Using a Dockerfile](#use-a-dockerfile).

Now, let's create a Rocket app! 🚀

## Create a Rocket app

**Note:** If you already have a Rocket app locally or on GitHub, you can skip this step and go straight to the [Deploy Rocket App to Railway](#deploy-the-rocket-app-to-railway).

To create a new Rocket app, ensure that you have [Rust](https://www.rust-lang.org/tools/install) installed on your machine.

Run the following command in your terminal to create a new Rust app:

```bash
cargo new helloworld --bin
```

The command creates a new binary-based Cargo project in a `helloworld` directory.

Next, `cd` into the directory and add Rocket as a dependency by running the following command:

```bash
cargo add rocket
```

This will add Rocket as a dependency, and you’ll see it listed in your `Cargo.toml` file.

### Modify the application file

Next, open the app in your IDE and navigate to the `src/main.rs` file.

Replace the content with the code below:

```rust
#[macro_use]
extern crate rocket;

#[get("/")]
fn index() -> &'static str {
    "Hello world, Rocket!"
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index])
}
```

The code above uses the Rocket framework to create a basic web server that responds to HTTP requests. It defines a simple route using the `#[get("/")]` macro, which tells Rocket to handle GET requests to the root URL `(/)`.

The `index()` function is the handler for this route and returns a static string, **"Hello world, Rocket!"**, which will be sent as the response when the root URL is accessed.

The `#[launch]` attribute on the `rocket()` function marks it as the entry point to launch the application. Inside `rocket()`, the server is built with `rocket::build()` and the index route is mounted to the root path `/` using `mount()`.

When the application runs, it listens for incoming requests and serves the "Hello world, Rocket!" response for requests made to the root URL, demonstrating a simple routing and response mechanism in Rocket.

### Run the Rocket app locally

Run the following command in the `helloworld` directory via the terminal:

```bash
cargo run
```

All the dependencies will be installed and your app will be launched.

Open your browser and go to `http://localhost:8000` to see your app.

## Deploy the Rocket app to Railway

Railway offers multiple ways to deploy your Rocket app, depending on your setup and preference.
