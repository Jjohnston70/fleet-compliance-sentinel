# deploying a monorepo (Chunk 3/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/deploying-a-monorepo.md
Original Path: guides/deploying-a-monorepo.md
Section: guides
Chunk: 3/3

---

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
