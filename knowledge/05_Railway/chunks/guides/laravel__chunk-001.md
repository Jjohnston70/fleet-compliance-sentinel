# Deploy a Laravel App (Chunk 1/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/laravel.md
Original Path: guides/laravel.md
Section: guides
Chunk: 1/5

---

# Deploy a Laravel App

Learn how to deploy a Laravel app to Railway with this step-by-step guide. It covers quick setup, private networking, database integration, one-click deploys and other deployment strategies.

[Laravel](https://laravel.com) is a PHP framework designed for web artisans who value simplicity and elegance in their code. It stands out for its clean and expressive syntax, and offers built-in tools to handle many common tasks found in modern web applications, making development smoother and more enjoyable.

This guide covers how to deploy a Laravel app on Railway in three ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [From a GitHub repository](#deploy-from-a-github-repo).
3. [Using the CLI](#deploy-from-the-cli).

## One-click deploy from a template

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/fWEWWf)

This template sets up a basic Laravel application along with a Postgres database on Railway. You can also choose from a [variety of Laravel app templates](https://railway.com/templates?q=laravel) created by the community.

It is highly recommended that [you eject from the template after deployment](/templates/deploy#eject-from-template-repository) to create a copy of the repo on your GitHub account.

## Deploy from a GitHub repo

To deploy a Laravel app on GitHub to Railway, follow the steps below:

1. Create a [New Project.](https://railway.com/new)

2. Click **Deploy from GitHub repo**.

3. Select your GitHub repo.

   - Railway requires a valid GitHub account to be linked. If your Railway account isn't associated with one, you will be prompted to link it.

4. Click **Add Variables**.

   - Add all your app environment variables.

5. Click **Deploy**.

Once the deployment is successful, a Railway [service](/services) will be created for you. By default, this service will not be publicly accessible.

**Note:** Railway will automatically detect that it's a Laravel app during [deploy and run your app via php-fpm and nginx](https://nixpacks.com/docs/providers/php).

To set up a publicly accessible URL for the service, navigate to the **Networking** section in the [Settings](/overview/the-basics#service-settings) tab of your new service and click on [Generate Domain](/networking/public-networking#railway-provided-domain).

**Note**: [Jump to the **Set Up Database, Migrations, Crons and Workers** section](#deploy-via-custom-scripts) to learn how to run your Laravel app along with a Postgres(or MySQL) database, cron jobs, and workers.
