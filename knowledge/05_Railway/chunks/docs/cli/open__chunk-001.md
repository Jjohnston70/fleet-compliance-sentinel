# railway open (Chunk 1/1)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/cli/open.md
Original Path: docs/cli/open.md
Section: docs
Chunk: 1/1

---

# railway open

Open your project dashboard in the browser.

Open the Railway dashboard for the currently linked project in your default browser.

## Usage

```bash
railway open [OPTIONS]
```

## Options

| Flag | Description |
|------|-------------|
| `-p, --print` | Print the URL instead of opening it |

## Examples

### Open dashboard

```bash
railway open
```

Opens the project dashboard in your default browser.

### Print URL only

```bash
railway open --print
```

Outputs the dashboard URL without opening it. Useful for copying or scripting.

## Related

- [railway status](/cli/status)
- [railway link](/cli/link)
