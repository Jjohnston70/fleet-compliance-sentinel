Title: railway completion
Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/cli/completion.md
Original Path: docs/cli/completion.md
Section: docs

---

# railway completion

Generate shell completion scripts.

Generate shell completion scripts for the Railway CLI.

## Usage

```bash
railway completion
```

## Supported shells

- `bash`
- `zsh`
- `fish`
- `powershell`
- `elvish`

## Examples

### Bash

```bash
railway completion bash > /etc/bash_completion.d/railway
```

Or add to your `~/.bashrc`:

```bash
source <(railway completion bash)
```

### Zsh

```bash
railway completion zsh > "${fpath[1]}/_railway"
```

Or add to your `~/.zshrc`:

```bash
source <(railway completion zsh)
```

### Fish

```bash
railway completion fish > ~/.config/fish/completions/railway.fish
```

### PowerShell

```powershell
railway completion powershell >> $PROFILE
```

## Related

- [railway upgrade](/cli/upgrade)
