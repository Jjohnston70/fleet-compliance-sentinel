# High-Quality Screenshot Workflow

Use this to generate sharp PNG screenshots for Fleet-Compliance pages.

## 1) One-time auth profile setup

This opens Chrome with a dedicated capture profile.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\capture-fleet-screenshots.ps1 -InitAuthProfile
```

In that Chrome window:
1. Sign in.
2. Select the correct organization.
3. Close Chrome.

## 2) Capture all key pages

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\capture-fleet-screenshots.ps1 -UseAuthProfile
```

Default output:

`C:\Users\<you>\Desktop\pipelin Penny Pictures\HQ-Captures-<timestamp>\`

The run also writes:

`capture-manifest.json`

## 3) Optional custom output and resolution

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\capture-fleet-screenshots.ps1 `
  -UseAuthProfile `
  -Width 2560 `
  -Height 1600 `
  -OutputDir "C:\Users\<you>\Desktop\pipelin Penny Pictures\HQ-Captures-Customer-Demo"
```

## Notes

- If captures show sign-in pages, rerun step 1 and ensure org is selected before closing Chrome.
- Keep browser zoom at 100%.
- PNG output is used to avoid JPEG blur/compression artifacts.
