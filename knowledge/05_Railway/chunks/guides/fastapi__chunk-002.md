# Deploy a FastAPI App (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/fastapi.md
Original Path: guides/fastapi.md
Section: guides
Chunk: 2/2

---

## Use a Dockerfile

**Note:** If you already have an app directory or repo on your machine that you want to deploy, you can skip the first two steps.

1. Clone the forked `fastapi` repo and `cd` into the directory.
2. Delete the `railway.json` file.
3. Create a `Dockerfile` in the `fastapi` or app's root directory.
4. Add the content below to the `Dockerfile`:

   ```bash
   # Use the Python 3 alpine official image
   # https://hub.docker.com/_/python
   FROM python:3-alpine

   # Create and change to the app directory.
   WORKDIR /app

   # Copy local code to the container image.
   COPY . .

   # Install project dependencies
   RUN pip install --no-cache-dir -r requirements.txt

   # Run the web service on container startup.
   CMD ["hypercorn", "main:app", "--bind", "::"]
   ```

5. Either deploy via the CLI or from GitHub.

Railway automatically detects the `Dockerfile`, [and uses it to build and deploy the app.](/builds/dockerfiles)

**Note:** Railway supports also [deployment from public and private Docker images](/guides/services#deploying-a-public-docker-image).

## Next steps

Explore these resources to learn how you can maximize your experience with Railway:

- [Add a Database Service](/databases/build-a-database-service)
- [Monitor your app](/observability)
- [Running a Cron Job](/cron-jobs)
