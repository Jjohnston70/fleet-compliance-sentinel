$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path $scriptDir -Parent
$backendRoot = Join-Path $repoRoot "railway-backend"

Push-Location $backendRoot
try {
  railway run node ..\scripts\run-penny-evals.mjs
}
finally {
  Pop-Location
}
