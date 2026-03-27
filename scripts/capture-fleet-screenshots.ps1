param(
  [string]$BaseUrl = "https://www.pipelinepunks.com",
  [string]$OutputDir = "$env:USERPROFILE\Desktop\pipelin Penny Pictures\HQ-Captures-$(Get-Date -Format 'yyyy-MM-dd-HHmmss')",
  [int]$Width = 2560,
  [int]$Height = 1600,
  [switch]$UseAuthProfile,
  [switch]$InitAuthProfile,
  [string]$AuthProfileDir = "$env:USERPROFILE\Desktop\chrome-capture-profile",
  [string]$ChromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $ChromePath)) {
  throw "Chrome not found at: $ChromePath"
}

if ($InitAuthProfile) {
  New-Item -ItemType Directory -Path $AuthProfileDir -Force | Out-Null
  New-Item -ItemType Directory -Path (Join-Path $AuthProfileDir "Default") -Force | Out-Null
  Write-Host ""
  Write-Host "Opening Chrome with capture profile for one-time login..." -ForegroundColor Cyan
  Write-Host "1) Sign in to Clerk on the opened window." -ForegroundColor Yellow
  Write-Host "2) Select your organization." -ForegroundColor Yellow
  Write-Host "3) Close Chrome when done." -ForegroundColor Yellow
  Write-Host "4) Re-run this script with -UseAuthProfile." -ForegroundColor Yellow
  Write-Host ""
  & $ChromePath "--user-data-dir=$AuthProfileDir" "--profile-directory=Default" "$BaseUrl/sign-in"
  exit 0
}

$pages = @(
  @{ Name = "01-home"; Path = "/" },
  @{ Name = "02-fleet-dashboard"; Path = "/fleet-compliance" },
  @{ Name = "03-assets"; Path = "/fleet-compliance/assets" },
  @{ Name = "04-employees"; Path = "/fleet-compliance/employees" },
  @{ Name = "05-compliance"; Path = "/fleet-compliance/compliance" },
  @{ Name = "06-suspense"; Path = "/fleet-compliance/suspense" },
  @{ Name = "07-alerts"; Path = "/fleet-compliance/alerts" },
  @{ Name = "08-invoices"; Path = "/fleet-compliance/invoices" },
  @{ Name = "09-new-invoice"; Path = "/fleet-compliance/invoices/new" },
  @{ Name = "10-spend-dashboard"; Path = "/fleet-compliance/spend" },
  @{ Name = "11-fmcsa-lookup"; Path = "/fleet-compliance/fmcsa" },
  @{ Name = "12-import-data"; Path = "/fleet-compliance/import" },
  @{ Name = "13-settings-alerts"; Path = "/fleet-compliance/settings/alerts" },
  @{ Name = "14-penny"; Path = "/penny" }
)

New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

if ($UseAuthProfile) {
  New-Item -ItemType Directory -Path $AuthProfileDir -Force | Out-Null
  New-Item -ItemType Directory -Path (Join-Path $AuthProfileDir "Default") -Force | Out-Null
}

$results = New-Object System.Collections.Generic.List[object]

foreach ($page in $pages) {
  $url = "$BaseUrl$($page.Path)"
  $filePath = Join-Path $OutputDir "$($page.Name).png"
  Remove-Item -LiteralPath $filePath -Force -ErrorAction SilentlyContinue
  $args = @(
    "--headless=new"
    "--disable-gpu"
    "--hide-scrollbars"
    "--window-size=$Width,$Height"
    "--screenshot=$filePath"
    "$url"
  )
  if ($UseAuthProfile) {
    $args = @(
      "--user-data-dir=$AuthProfileDir"
      "--profile-directory=Default"
    ) + $args
  }

  try {
    & $ChromePath @args | Out-Null
    $written = $false
    for ($i = 0; $i -lt 60; $i++) {
      Start-Sleep -Milliseconds 500
      if (Test-Path -LiteralPath $filePath) {
        $len = (Get-Item -LiteralPath $filePath).Length
        if ($len -gt 0) {
          $written = $true
          break
        }
      }
    }
    if (-not $written) {
      throw "Capture failed (timed out waiting for screenshot file)"
    }
    $size = (Get-Item -LiteralPath $filePath).Length
    Write-Host ("[OK] {0} -> {1} bytes" -f $page.Name, $size) -ForegroundColor Green
    $results.Add([pscustomobject]@{
        name = $page.Name
        path = $page.Path
        url = $url
        file = $filePath
        bytes = $size
      })
  } catch {
    Write-Host ("[ERR] {0} -> {1}" -f $page.Name, $_.Exception.Message) -ForegroundColor Red
    $results.Add([pscustomobject]@{
        name = $page.Name
        path = $page.Path
        url = $url
        file = $filePath
        bytes = 0
        error = $_.Exception.Message
      })
  }
}

$manifestPath = Join-Path $OutputDir "capture-manifest.json"
$results | ConvertTo-Json -Depth 4 | Set-Content -Path $manifestPath -Encoding UTF8

Write-Host ""
Write-Host "Capture complete." -ForegroundColor Cyan
Write-Host "Output: $OutputDir" -ForegroundColor Cyan
Write-Host "Manifest: $manifestPath" -ForegroundColor Cyan
if (-not $UseAuthProfile) {
  Write-Host "Tip: use -UseAuthProfile after running -InitAuthProfile to capture authenticated Fleet pages." -ForegroundColor Yellow
}
