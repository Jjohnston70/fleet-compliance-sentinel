# Deploy a Flask App (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/flask.md
Original Path: guides/flask.md
Section: guides
Chunk: 2/3

---

### Prepare the Flask app for deployment

1. Run the following command to install a production web server, [gunicorn](https://gunicorn.org):

```bash
pip install gunicorn
```

Next, run the following command to serve the app with gunicorn:

```bash
gunicorn main:app
```

2. Open your browser and go to `http://127.0.0.1:8000` to see the app running with a production server.

Create a `requirements.txt` file to store the dependencies of the packages needed to run the app.

```bash
pip freeze > requirements.txt
```

**Note:** It's only safe to run the command above in a virtual environment, else it will freeze all python packages installed on your system.

3. Finally, create a `nixpacks.toml` file in the root directory of the app. Add the following content to it:

```toml

# nixpacks.toml

[start]
cmd = "gunicorn main:app"
```

This setup instructs Railway to use Gunicorn as the server to start the application.

**Note:** The [nixpacks.toml file](https://nixpacks.com/docs/configuration/file) is a configuration file used by Nixpacks, a build system developed and used by Railway, to set up and deploy applications.

In this file, you can specify the instructions for various build and deployment phases, along with environment variables and package dependencies.

With these changes, your Flask app is now ready to be deployed to Railway!

## Deploy Flask app to Railway

Railway offers multiple ways to deploy your Flask app, depending on your setup and preference. Choose any of the following methods:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [Using the CLI](#deploy-from-the-cli).
3. [From a GitHub repository](#deploy-from-a-github-repo).

## One-click deploy from a template

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/zUcpux)

It is highly recommended that [you eject from the template after deployment](/templates/deploy#eject-from-template-repository) to create a copy of the repo on your GitHub account.

**Note:** You can also choose from a [variety of Flask app templates](https://railway.com/templates?q=flask) created by the community.

## Deploy from the CLI

1. **Install the Railway CLI**:
   - [Install the CLI](/guides/cli#installing-the-cli) and [authenticate it](/guides/cli#authenticating-with-the-cli) using your Railway account.
2. **Initialize a Railway Project**:
   - Run the command below in your Flask app directory.
     ```bash
     railway init
     ```
   - Follow the prompts to name your project.
   - After the project is created, click the provided link to view it in your browser.
3. **Deploy the Application**:
   - Use the command below to deploy your app:
     ```bash
     railway up
     ```
   - This command will scan, compress and upload your app's files to Railway. You’ll see real-time deployment logs in your terminal.
4. **Verify the Deployment**:
   - Once the deployment completes, go to [**View logs**](/observability/logs#build--deploy-panel) to check if the server is running successfully.
5. **Set Up a Public URL**:
   - Navigate to the **Networking** section under the [Settings](/overview/the-basics#service-settings) tab of your new service.
   - Click [Generate Domain](/networking/public-networking#railway-provided-domain) to create a public URL for your app.
