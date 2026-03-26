$ErrorActionPreference = "Stop"

$chiefRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$websiteRoot = Split-Path (Split-Path $chiefRoot -Parent) -Parent

Write-Host "Rebuilding Chief import snapshot..."
python (Join-Path $chiefRoot "build_chief_imports.py")

Write-Host "Running website lint..."
Push-Location $websiteRoot
try {
  npm run lint
}
finally {
  Pop-Location
}

Write-Host ""
Write-Host "Chief refresh complete."
Write-Host "Generated imports: $(Join-Path $chiefRoot 'generated_imports')"
Write-Host "Website data module: $(Join-Path $websiteRoot 'src\\lib\\chief-imported-data.generated.ts')"
