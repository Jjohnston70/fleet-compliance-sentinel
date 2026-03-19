# railway starship (Chunk 1/1)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/cli/starship.md
Original Path: docs/cli/starship.md
Section: docs
Chunk: 1/1

---

# railway starship

Output metadata for Starship prompt integration.

Output project metadata in JSON format for Starship prompt integration.

## Usage

```bash
railway starship
```

This command is primarily used for [Starship](https://starship.rs/) prompt integration to display Railway project information in your terminal prompt.

## Output

Returns JSON containing the linked project information:

```json
{
  "project": "project-id",
  "name": "my-project",
  "environment": "environment-id",
  "environmentName": "production"
}
```

## Related

- [railway status](/cli/status)
