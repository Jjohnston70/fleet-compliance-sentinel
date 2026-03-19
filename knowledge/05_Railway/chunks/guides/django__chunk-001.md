# Deploy a Django App (Chunk 1/7)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/django.md
Original Path: guides/django.md
Section: guides
Chunk: 1/7

---

# Deploy a Django App

Learn how to deploy a Python Django app to Railway with this step-by-step guide. It covers quick setup, database integration, private networking, Celery, one-click deploys and other deployment strategies.

[Django](https://www.djangoproject.com) is a powerful Python web framework that simplifies web development by providing ready-to-use tools for rapid development and clean design.

It’s free, open-source, and comes with a range of features to streamline tasks like authentication, routing, and database management, so developers can focus on building their applications without handling everything from scratch.

## Create a Django app

**Note:** If you already have a Django app locally or on GitHub, you can skip this step and go straight to the [Deploy Django App on Railway](#deploy-django-app-on-railway).

To create a new Django app, ensure that you have [Python](https://www.python.org/downloads/) and [Django](https://docs.djangoproject.com/en/5.1/intro/install/) installed on your machine.

Follow the steps below to set up the project in a directory.

Create a virtual environment

```bash
python -m venv env
```

Activate the virtual environment

```bash
source env/bin/activate
```

**Note:** For windows developers, run it as `env\Scripts\activate` in your terminal.

Install Django

```bash
python -m pip install django
```

Once everything is set up, run the following command in your terminal to provision a new Django project:

```bash
django-admin startproject liftoff
```

This command will create a new Django project named `liftoff`.

Next, `cd` into the directory and run `python manage.py runserver` to start your project.

Open your browser and go to `http://127.0.0.1:8000` to see the project. You'll see the Django welcome page with a "The install worked successfully! Congratulations!" paragraph.

**Note:** You'll see a red notice about unapplied migration(s). You can ignore them for now. You'll run them when you deploy the project.

Now that your app is running locally, let’s move on to make some changes and install some dependencies before deployment.

## Configure database, static files & dependencies

1. Install the following packages within the `liftoff` directory, where you can see the `manage.py` file.

```bash
python -m pip install gunicorn whitenoise psycopg[binary,pool]
```

[whitenoise](https://whitenoise.readthedocs.io/en/stable/index.html) is a Python package for serving static files directly from your web app. It serves compressed content and sets far-future cache headers on content that won't change.

[gunicorn](https://gunicorn.org) is a production ready web server.

[pyscog](https://www.psycopg.org/psycopg3/docs) is python package that allows Django work with Postgresql.

2. Import the `os` module:

Open the `liftoff/settings.py` file located in the inner `liftoff` directory (the one containing the main project settings).

At the top of the file, add the following line to import the `os` module, placing it just before the `Path` import:

```python
import os
from pathlib import Path
```

3. Configure the database and run migrations:

A fresh Django project uses SQLite by default, but you need to switch to PostgreSQL.

Create a database named `liftoff_dev` in your local Postgres instance.

Open the `liftoff/settings.py` file. In the Database section, replace the existing configuration with:

```python

# Database

# https://docs.djangoproject.com/en/5.1/ref/settings/#databases
