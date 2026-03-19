# Telemetry (Chunk 1/1)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/cli/telemetry.md
Original Path: docs/cli/telemetry.md
Section: docs
Chunk: 1/1

---

# Telemetry

What the Railway CLI collects and how to opt out.

The Railway CLI collects usage telemetry to help improve the developer experience.

## What is collected

| Field | Description |
|-------|-------------|
| Command name | The command that was run (e.g. `up`, `deploy`) |
| Subcommand name | The subcommand, if any (e.g. `list` in `variable list`) |
| Duration | How long the command took to execute, in milliseconds |
| Success | Whether the command completed successfully |
| Error message | A truncated error message if the command fails |
| OS | The operating system (e.g. `linux`, `macos`, `windows`) |
| Architecture | The CPU architecture (e.g. `x86_64`, `aarch64`) |
| CLI version | The version of the Railway CLI |
| CI | Whether the command was run in a CI environment |

No project source code, or environment variable values are collected.

## Opting out

Set either environment variable to `1` to disable telemetry:

```bash

# or
```

`DO_NOT_TRACK` follows the [Console Do Not Track](https://consoledonottrack.com/) convention. `RAILWAY_NO_TELEMETRY` is a Railway-specific alternative.
