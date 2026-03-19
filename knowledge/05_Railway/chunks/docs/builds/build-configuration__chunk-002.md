# Build Configuration (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/builds/build-configuration.md
Original Path: docs/builds/build-configuration.md
Section: docs
Chunk: 2/2

---

## Install specific packages using Railpack

| Environment variable            | Description                                                    |
|---------------------------------|----------------------------------------------------------------|
| `RAILPACK_PACKAGES`             | A list of [Mise](https://mise.jdx.dev/) packages to install    |
| `RAILPACK_BUILD_APT_PACKAGES`   | Install additional Apt packages during build                   |
| `RAILPACK_DEPLOY_APT_PACKAGES`  | Install additional Apt packages in the final image             |

See the [Railpack docs](https://railpack.com/config/environment-variables) for more information.

## Procfiles

Railpack automatically detects commands defined in
[Procfiles](https://railpack.com/config/procfile). Although this is not
recommended and specifing the start command directly in your service settings is
preferred.

## Specify a custom install command

You can override the install command by setting the `RAILPACK_INSTALL_COMMAND`
environment variable in your service settings.

## Disable build layer caching

By default, Railway will cache build layers to provide faster build times. If
you have a need to disable this behavior, set the following environment variable
in your service:

```plaintext
NO_CACHE=1
```

## Why isn't my build using cache?

Since Railway's build system scales up and down in response to demand, cache hit
on builds is not guaranteed.

If you have a need for faster builds and rely on build cache to satisfy that
requirement, you should consider creating a pipeline to build your own image and
deploy your image directly.
