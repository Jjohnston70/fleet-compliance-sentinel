# Build and Start Commands (Chunk 1/1)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/builds/build-and-start-commands.md
Original Path: docs/builds/build-and-start-commands.md
Section: docs
Chunk: 1/1

---

# Build and Start Commands

Learn how to configure build and start commands.

Railway uses [Railpack](/builds/railpack) to automatically detect and configure build and start commands when an image is built and deployed to a [service](/services).

If necessary, build and start commands can be manually configured.

## How it works

Overrides are exposed in the service configuration to enable customizing the Build and Start commands. When an override is configured, Railway uses the commands specified to build and start the service.

#### Build command

The command to build the service, for example `yarn run build`. Override the detected build command by setting a value in your service settings.

#### Start command

Railway automatically configures the start command based on the code being deployed.

If your service deploys with a [Dockerfile](/builds/dockerfiles) or from an [image](/services#docker-image), the start command defaults to the `ENTRYPOINT` and / or `CMD` defined in the Dockerfile.

Override the detected start command by setting a value in your service settings.

If you need to use environment variables in the start command for services deployed from a Dockerfile or image you will need to wrap your command in a shell -

```shell
/bin/sh -c "exec python main.py --port $PORT"
```

This is because commands ran in exec form do not support variable expansion.

## Support

For more information on how to configure builds, check out the [Builds](/builds) guide section.

For more information on how to configure a service's deployment lifecycle, like the Start command, check out the [Deployments](/deployments) guide section.
