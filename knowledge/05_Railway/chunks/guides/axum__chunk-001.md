# Deploy a Rust Axum App (Chunk 1/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/axum.md
Original Path: guides/axum.md
Section: guides
Chunk: 1/4

---

# Deploy a Rust Axum App

Learn how to deploy an Axum app to Railway with this step-by-step guide. It covers quick setup, one-click deploys, GitHub, Dockerfile and other deployment strategies.

[Axum](https://docs.rs/axum/latest/axum) is a web framework for Rust that focuses on ergonomics and modularity. It is designed to work with [tokio](https://docs.rs/tokio/1.40.0/x86_64-unknown-linux-gnu/tokio/index.html) and [hyper](https://docs.rs/hyper/1.4.1/x86_64-unknown-linux-gnu/hyper/index.html).

This guide covers how to deploy an Axum app to Railway in four ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [From a GitHub repository](#deploy-from-a-github-repo).
3. [Using the CLI](#deploy-from-the-cli).
4. [Using a Dockerfile](#use-a-dockerfile).

Now, let's create an Axum app! 🚀

## Create an Axum app

**Note:** If you already have an Axum app locally or on GitHub, you can skip this step and go straight to the [Deploy Axum App to Railway](#deploy-the-axum-app-to-railway).

To create a new Axum app, ensure that you have [Rust](https://www.rust-lang.org/tools/install) installed on your machine.

Run the following command in your terminal to create a new Axum app:

```bash
cargo new helloworld --bin
```

The command creates a new binary-based Cargo project in a `helloworld` directory.

Next, `cd` into the directory and add `axum` and `tokio` as dependencies by running the following command:

```bash
cargo add axum
cargo add tokio --features full
```

This will add `axum` and `tokio` as dependencies, with `tokio` configured to use the "full" feature, which includes its complete set of capabilities. You’ll find both dependencies listed in your `Cargo.toml` file.

These dependencies are required to create a bare minimum axum application.
