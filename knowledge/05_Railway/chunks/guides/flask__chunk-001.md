# Deploy a Flask App (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/flask.md
Original Path: guides/flask.md
Section: guides
Chunk: 1/3

---

# Deploy a Flask App

Learn how to deploy a Flask app to Railway with this step-by-step guide. It covers quick setup, one-click deploys, Dockerfile and other deployment strategies.

[Flask](https://flask.palletsprojects.com/en/stable) is a Python micro framework for building web applications.

This guide covers how to deploy a Flask app to Railway in four ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [Using the CLI](#deploy-from-the-cli).
3. [From a GitHub repository](#deploy-from-a-github-repo).
4. [Using a Dockerfile](#use-a-dockerfile).

Now, let's create a Flask app!

## Create a Flask app

**Note:** If you already have a Flask app locally or on GitHub, you can skip this step and go straight to the [Deploy Flask App to Railway](#deploy-flask-app-to-railway).

To create a new Flask app, ensure that you have [Python](https://www.python.org/downloads) and [Flask](https://flask.palletsprojects.com/en/stable/installation/#install-flask) installed on your machine.

Follow the steps blow to set up the project in a directory.

Create a project directory and `cd` into it.

```bash
mkdir flaskproject
cd flaskproject
```

Create a virtual environment

```bash
python -m venv env
```

Activate the virtual environment

```bash
source env/bin/activate
```

**Note:** For windows developers, run it as `env\Scripts\activate` in your terminal.

Install Flask

```bash
python -m pip install flask
```

Now create a new file, `helloworld.py` in the `flaskproject` directory. Add the following content to it:

```python
import os
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello world, welcome to Railway!'
```

1. `from flask import Flask`:
   - This line imports the Flask class from the Flask framework, which is used to create and manage a web application.
2. `app = Flask(__name__)`:
   - This line creates an instance of the Flask class and assigns it to the app variable.
   - The `__name__` argument helps Flask identify the location of the application. It's useful for determining resource paths and error reporting.
3. `@app.route('/')`:
   - The `@app.route('/')` decorator sets up a URL route for the app. When the root URL `(/)` is accessed, Flask will execute the function immediately below this decorator.
4. `def hello():`
   - The `hello` function returns a plain text message, _"Hello world, welcome to Railway!"_, which is displayed in the browser when the root URL of the app is accessed.

### Run the Flask app locally

To run the application, use the `flask` command.

```bash
flask --app helloworld run
```

Open your browser and go to `http://127.0.0.1:5000` to see the app running with a local development server.
