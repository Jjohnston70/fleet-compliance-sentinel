# Deploy a Django App (Chunk 2/7)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/django.md
Original Path: guides/django.md
Section: guides
Chunk: 2/7

---

# Set default values for the environment variables if they’re not already set
os.environ.setdefault("PGDATABASE", "liftoff_dev")
os.environ.setdefault("PGUSER", "username")
os.environ.setdefault("PGPASSWORD", "")
os.environ.setdefault("PGHOST", "localhost")
os.environ.setdefault("PGPORT", "5432")

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ["PGDATABASE"],
        'USER': os.environ["PGUSER"],
        'PASSWORD': os.environ["PGPASSWORD"],
        'HOST': os.environ["PGHOST"],
        'PORT': os.environ["PGPORT"],
    }
}
```

Replace the values of `PGUSER`, `PGPASSWORD` with your local credentials.

Run `python manage.py migrate` in your terminal to apply the database migrations. Once it completes successfully, check your database. You should see the auth and other Django tables created.

4. Static files configuration:

Configure Django to serve static files using [WhiteNoise](https://whitenoise.readthedocs.io/en/stable/index.html).

Open `liftoff/settings.py` and configure the static files settings:

```python
STATIC_URL = 'static/'

STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
STATICFILES_DIRS = [os.path.join(BASE_DIR, "static")]
```

Add the WhiteNoise middleware in the **MIDDLEWARE** section, just below the [security middleware](https://docs.djangoproject.com/en/5.1/ref/middleware/#module-django.middleware.security):

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

5. Update `ALLOWED_HOSTS` settings:

```python
ALLOWED_HOSTS = ["*"]
```

This setting represents the list of all the host/domain names your Django project can serve.

6. Create a **static** folder:

Inside your `liftoff` directory, create a static folder where all static assets will reside.

7. Create a `requirements.txt` file:

To track all the dependencies for deployment, create a `requirements.txt` file:

```bash
pip freeze > requirements.txt
```

**Note:** It's only safe to run the command above in a virtual environment, else it will freeze all python packages installed on your system.

With these changes, your Django app is now ready to be deployed to Railway!

## Deploy Django app on Railway

Railway offers multiple ways to deploy your Django app, depending on your setup and preference. Choose any of the following methods:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [Using the CLI](#deploy-from-the-cli).
3. [From a GitHub repository](#deploy-from-a-github-repo).

## One-click deploy from a template

If you’re looking for the fastest way to get started, the one-click deploy option is ideal. It sets up a Django app along with a Postgres database.

Click the button below to begin:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/GB6Eki)

After deploying, it is recommended that you [eject from the template](/templates/deploy#eject-from-template-repository) to create a copy of the repository under your own GitHub account. This will give you full control over the source code and project.
