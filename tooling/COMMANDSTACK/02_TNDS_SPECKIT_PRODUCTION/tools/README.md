# Tools

Scripts, helpers, and one-off automation. Not app logic.

## What Goes Here

- Deployment scripts: `deploy.ps1`, `deploy.sh`
- Setup scripts: `setup-dev.sh`, `init-project.ps1`
- Utility scripts: `clean-cache.sh`, `backup-db.ps1`
- Git helpers: `git-push.bat`
- Build helpers: `build-release.sh`

## What Does NOT Go Here

- App source code → `/src`
- Documentation → `/docs`
- Configuration files → root

## Naming Convention

Use lowercase with hyphens:
- `deploy-production.ps1`
- `setup-dev.sh`
- `clean-install.bat`
- `backup-database.ps1`

## Script Guidelines

1. **Add a header comment** explaining what the script does
2. **Handle errors** gracefully
3. **Use parameters** instead of hardcoded values
4. **Test locally** before committing
