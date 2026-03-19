# Set a Start Command

Learn how to set up a start command in your service to run your deployments on Railway.

A start command is the process used to run a Deployment's code, for example `python main.py` or `npm run start`.

Railway automatically configures the start command based on the code being
deployed, see [Build and Start Commands](/builds/build-and-start-commands) for more details

## Configure the start command

When necessary, start commands may be overridden, like for advanced use-cases such as deploying multiple projects from a single [monorepo](/deployments/monorepo).

When specifying a start command, the behavior depends on the type of deployment:

- **Dockerfile / Image**: the start command overrides the image's `ENTRYPOINT` in [exec form](https://docs.docker.com/reference/dockerfile/#shell-and-exec-form).

  If you need to use environment variables in the start command for services deployed from a Dockerfile or image you will need to wrap your command in a shell -

  ```shell
  /bin/sh -c "exec python main.py --port $PORT"
  ```

  This is because commands ran in exec form do not support variable expansion.

- **Nixpacks**: the start command is ran in a shell process.

  This supports the use of environment variables without needing to wrap your command in a shell.

## Dockerfiles & images

If your service deploys with a Dockerfile or from an image, the start command defaults to the `ENTRYPOINT` and / or `CMD` defined in the Dockerfile.
