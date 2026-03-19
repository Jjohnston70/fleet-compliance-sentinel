# Deploy a Beego App (Chunk 1/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/beego.md
Original Path: guides/beego.md
Section: guides
Chunk: 1/4

---

# Deploy a Beego App

Learn how to deploy a Beego app to Railway with this step-by-step guide. It covers quick setup, private networking, database integration, one-click deploys and other deployment strategies.

[Beego](https://github.com/beego/beego) is a high-performance, open-source web framework designed for building robust applications in Go (Golang). It is used for rapid development of enterprise apps, including RESTful APIs, web apps and backend services.

This guide covers how to deploy a Beego app to Railway in four ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [From a GitHub repository](#deploy-from-a-github-repo).
3. [Using the CLI](#deploy-from-the-cli).
4. [Using a Dockerfile](#use-a-dockerfile).

Now, let's create a Beego app!

## Create a Beego app

**Note:** If you already have a Beego app locally or on GitHub, you can skip this step and go straight to the [Deploy Beego App to Railway](#deploy-the-beego-app-to-railway).

To create a new Beego app, ensure that you have [Go](https://go.dev/dl) and [Bee tool](https://doc.meoying.com/en-US/beego/developing/#manual-installation) installed on your machine.

Run the following command in your terminal to create a new Beego app and install all dependencies:

```bash
bee new helloworld
cd helloworld
go mod tidy
```

A new Beego app will be provisioned for you in the `helloworld` directory.
