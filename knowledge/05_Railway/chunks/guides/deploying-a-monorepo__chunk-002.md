# Deploying a Monorepo to Railway (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/deploying-a-monorepo.md
Original Path: guides/deploying-a-monorepo.md
Section: guides
Chunk: 2/2

---

## 4. Directory setup

Both apps deploy from subdirectories of the monorepo, so you need to tell Railway where they are located.

- Open the Frontend service to its service settings and you will see a **Root Directory** option, in this case, set it to `/frontend`

- Open the Backend service settings and set its root directory to `/backend`

- Click the `Deploy` button or `⇧ Enter` to save these changes.

## 5. Connecting the repo

Now configure the source of the service where the code is deployed.

- Open the service settings for each service and connect your monorepo.

Frontend

Backend

- Click the `Deploy` button or `⇧ Enter` to deploy your applications

**Your services will now build and deploy.**

## 6. Domain setup

Even though the services are now running, the frontend and backend aren't networked together yet. So let's setup domains for each service.

Both the Vite Frontend and the Go Backend are already configured so that Railway will ✨automagically detect the port they're running on. Railway does this by detecting the `env.$PORT` variable that the service is binding. For simplicity's sake, these two services will be connected over their public domain so you can get a handle on the basics. In practice, you may need to configure your networking a bit differently. You can [read more about networking in the docs](/networking/public-networking).

Let's add public domains to both services.

- Click on the service and then open the Settings tab.

- Click on `Generate Domain`. Railway will ✨automagically assign the port based on the deployed service.

- Do these steps for both services, so that they both have public domains.

**Notes:**

- **Setting a Custom `$PORT`:** Adding the domain after the service is deployed allows Railway to detect the bound `env.$PORT`. You could instead decide to manually set the `$PORT` variable on the Variables tab, and set the Domain to use that custom port instead.

## 7. Variable setup

For the example monorepo the Frontend service needs a `VITE_BACKEND_HOST` variable, and the backend needs an `ALLOWED_ORIGINS` variable.

Let's add the Frontend variable first.

- Click on Frontend service, then the `Variables` tab

- Add the required variable -

      ```plaintext
      VITE_BACKEND_HOST=${{Backend.RAILWAY_PUBLIC_DOMAIN}}
      ```

  It should look like this once added:

Now let's add the Backend variable.

- Click on the Backend service, then the `Variables` tab

- Add the required variable -

  ```plaintext
  ALLOWED_ORIGINS=${{Frontend.RAILWAY_PUBLIC_DOMAIN}}
  ```

It should look like this once added:

- Click the `Deploy` button or `⇧ Enter` to save these changes.

- Your services should be deployed and available now! Click on your frontend service on the Deployment tab and you can click your domain to see the webapp.

**Notes:**

- The variables used here are reference variables, learn more about them [here](/variables#referencing-another-services-variable).

- Both the Frontend and Backend variables reference each other's public domains. The `RAILWAY_PUBLIC_DOMAIN` variable will be automatically updated whenever you deploy or re-deploy a service.

- See a list of additional variables [here](/variables/reference#railway-provided-variables).

## Conclusion

Congratulations! You have setup a project, setup services, added variables and deployed your monorepo project to Railway. The Frontend service should be accessible on its public domain to access the deployed website.
