# Deploy a Symfony App (Chunk 1/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/symfony.md
Original Path: guides/symfony.md
Section: guides
Chunk: 1/6

---

# Deploy a Symfony App

Learn how to deploy a Symfony app to Railway with this step-by-step guide. It covers quick setup, database integration, cron and workers, one-click deploys and other deployment strategies.

[Symfony](https://symfony.com) is a PHP web framework composed of a set of decoupled and reusable components all working together in harmony to create websites and web applications.

This guide covers how to deploy a Symfony app to Railway in three ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [From a GitHub repository](#deploy-from-a-github-repo).
3. [Using the CLI](#deploy-from-the-cli).

Now, let's create a Symfony app!

## Create a Symfony app

**Note:** If you already have a Symfony app locally or on GitHub, you can skip this step and go straight to the [Deploy Symfony App to Railway](#deploy-the-symfony-app-to-railway).

To create a new Symfony app, ensure that you have [Composer](https://getcomposer.org/download/), [PHP](https://www.php.net/manual/en/install.php) and [Symfony](https://symfony.com/download) installed on your machine.

Run the following command in your terminal to create a new Symfony app:

```bash
symfony new --webapp apphelloworld
```

A new Symfony app will be provisioned for you in the `apphelloworld` directory.

### Run the Symfony app locally

To start your app, run:

```bash
symfony server:start
```

Once the app is running, open your browser and navigate to `http://localhost:8000` to view it in action.

## Deploy the Symfony app to Railway

Railway offers multiple ways to deploy your Symfony app, depending on your setup and preference.

## One-click deploy from a template

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/4tnH_D)

This template sets up a starter Symfony application along with a Postgres database on Railway. You can also choose from a [variety of Symfony app templates](https://railway.com/templates?q=symfony) created by the community.

It is highly recommended that [you eject from the template after deployment](/templates/deploy#eject-from-template-repository) to create a copy of the repo on your GitHub account.
