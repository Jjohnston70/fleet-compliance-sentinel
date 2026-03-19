# Deploy a Flask App (Chunk 3/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/flask.md
Original Path: guides/flask.md
Section: guides
Chunk: 3/3

---

## Deploy from a GitHub repo

To deploy a Flask app to Railway directly from GitHub, follow the steps below:

1. **Create a New Project on Railway**:
   - Go to [Railway](https://railway.com/new) to create a new project.
2. **Deploy from GitHub**:
   - Select **Deploy from GitHub repo** and choose your repository.
     - If your Railway account isn’t linked to GitHub yet, you’ll be prompted to do so.
3. **Deploy the App Service**:
   - Click **Deploy** on the Railway project canvas to apply your changes.
4. **Verify the Deployment**:

   - Once the deployment completes, go to [**View logs**](/observability/logs#build--deploy-panel) to check if the server is running successfully.

   **Note:** During the deployment process, Railway will automatically [detect that it's a Python app via Railpack](https://railpack.com/languages/python).

5. **Set Up a Public URL**:
   - Navigate to the **Networking** section under the [Settings](/overview/the-basics#service-settings) tab of your new service.
   - Click [Generate Domain](/networking/public-networking#railway-provided-domain) to create a public URL for your app.

## Use a Dockerfile

1. Create a `Dockerfile` in the app's root directory.
2. Add the content below to the `Dockerfile`:

   ```docker
   # Use the Python 3 official image
   # https://hub.docker.com/_/python
   FROM python:3

   # Run in unbuffered mode
   ENV PYTHONUNBUFFERED=1

   # Create and change to the app directory.
   WORKDIR /app

   # Copy local code to the container image.
   COPY . ./

   # Install project dependencies
   RUN pip install --no-cache-dir -r requirements.txt

   # Run the web service on container startup.
   CMD ["gunicorn", "main:app"]
   ```

3. Either deploy via the CLI or from GitHub.

Railway automatically detects the `Dockerfile`, [and uses it to build and deploy the app.](/builds/dockerfiles)

**Note:** Railway supports also [deployment from public and private Docker images](/guides/services#deploying-a-public-docker-image).

## Next steps

Explore these resources to learn how you can maximize your experience with Railway:

- [Add a Database Service](/databases/build-a-database-service)
- [Monitor your app](/observability)
- [Running a Cron Job](/cron-jobs)
