# Advanced Usage (Chunk 1/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/overview/advanced-concepts.md
Original Path: docs/overview/advanced-concepts.md
Section: docs
Chunk: 1/4

---

# Advanced Usage

A guide that outlines the advanced concepts of Railway.

There are a lot of advanced concepts of Railway that can help you build your applications better. This document will cover some of these concepts like build and deploy options, networking, observability, and other integrations.

## Build and deploy options

Railway applies many defaults to your build and deploy configurations that work fine for most scenarios. Changing these defaults could help tune Railway better to your use-case and make it easier on your team.

### Build options

Under the hood, Railway uses [Railpack](https://railpack.com) to package your code into a container image that we then deploy to Railway's infrastructure, with zero configuration for most workloads. For advanced projects, you might need to configure some of these defaults. You can do this by going to your Service > Settings > Build, and underneath that, Deploy. Here are three things you might want to configure:

- **Custom Build Command**: This is the command that will be ran to build your final application. Railpack will find the best command for this, usually `npm run build` for JS-based projects, `cargo build --release` for Rust projects, and more. If your application needs to trigger something else to build your project, customize that command here.
- [**Pre-Deploy Command**](/deployments/pre-deploy-command): These are one or more commands that will be ran before running the main start command. A common use for this is database migrations. If your application needs to run a command before starting your main application, put that in a Pre-Deploy Command.
- **Custom Start Command**: This is the command that will actually run your application. Defaulted as `npm run start` for JS-based applications. If you need to start your application in a way that's different than expected, change that here.
