param(
  [string]$Module,
  [ValidateSet('list', 'install', 'test', 'build', 'dev', 'start', 'run')]
  [string]$Action = 'list',
  [string]$Script,
  [string[]]$ExtraArgs,
  [switch]$RespectLifecycleScripts
)

$ErrorActionPreference = 'Stop'

function Invoke-CheckedCommand {
  param(
    [Parameter(Mandatory = $true)][string]$WorkingDirectory,
    [Parameter(Mandatory = $true)][string]$FileName,
    [string[]]$Arguments
  )

  $argText = if ($Arguments -and $Arguments.Count -gt 0) { $Arguments -join ' ' } else { '' }
  Write-Host "[run] $FileName $argText"
  Write-Host "[cwd] $WorkingDirectory"

  Push-Location $WorkingDirectory
  try {
    & $FileName @Arguments
    $exitCode = $LASTEXITCODE
  }
  finally {
    Pop-Location
  }

  if ($exitCode -ne 0) {
    throw "Command failed with exit code ${exitCode}: $FileName $argText"
  }
}

function Get-ModuleInfo {
  param(
    [Parameter(Mandatory = $true)][string]$ToolingRoot,
    [Parameter(Mandatory = $true)][string]$ModuleName
  )

  $modulePath = Join-Path $ToolingRoot $ModuleName
  if (-not (Test-Path -LiteralPath $modulePath -PathType Container)) {
    throw "Module '$ModuleName' not found under '$ToolingRoot'."
  }

  $packageJsonPath = Join-Path $modulePath 'package.json'
  $requirementsPath = Join-Path $modulePath 'requirements.txt'
  $setupPyPath = Join-Path $modulePath 'setup.py'
  $testsPath = Join-Path $modulePath 'tests'

  $isNode = Test-Path -LiteralPath $packageJsonPath
  $isPython = (Test-Path -LiteralPath $requirementsPath) -or (Test-Path -LiteralPath $setupPyPath)

  $scripts = @{}
  if ($isNode) {
    $packageJson = Get-Content -Raw -LiteralPath $packageJsonPath | ConvertFrom-Json
    if ($packageJson.scripts) {
      foreach ($prop in $packageJson.scripts.PSObject.Properties) {
        $scripts[$prop.Name] = [string]$prop.Value
      }
    }
  }

  return [PSCustomObject]@{
    Name             = $ModuleName
    Path             = $modulePath
    IsNode           = $isNode
    IsPython         = $isPython
    PackageJsonPath  = $packageJsonPath
    RequirementsPath = $requirementsPath
    SetupPyPath      = $setupPyPath
    TestsPath        = $testsPath
    Scripts          = $scripts
  }
}

function Show-ModuleList {
  param([Parameter(Mandatory = $true)][string]$ToolingRoot)

  $rows = Get-ChildItem -Directory -LiteralPath $ToolingRoot | ForEach-Object {
    $packageJsonPath = Join-Path $_.FullName 'package.json'
    $requirementsPath = Join-Path $_.FullName 'requirements.txt'
    $setupPyPath = Join-Path $_.FullName 'setup.py'
    $testsPath = Join-Path $_.FullName 'tests'

    $moduleType = 'unknown'
    if (Test-Path -LiteralPath $packageJsonPath) {
      $moduleType = 'node'
    }
    elseif ((Test-Path -LiteralPath $requirementsPath) -or (Test-Path -LiteralPath $setupPyPath)) {
      $moduleType = 'python'
    }

    [PSCustomObject]@{
      module    = $_.Name
      type      = $moduleType
      has_tests = (Test-Path -LiteralPath $testsPath)
    }
  }

  $rows | Sort-Object module | Format-Table -AutoSize
}

function Invoke-NodeAction {
  param(
    [Parameter(Mandatory = $true)]$ModuleInfo,
    [Parameter(Mandatory = $true)][string]$RequestedAction,
    [string]$ScriptName,
    [string[]]$Args,
    [switch]$HonorLifecycle
  )

  switch ($RequestedAction) {
    'install' {
      $npmArgs = @('ci', '--no-audit', '--no-fund')
      if (($ModuleInfo.Name -eq 'proposal-command') -and (-not $HonorLifecycle)) {
        # proposal-command has a prepare hook that fails in this repo state.
        $npmArgs += '--ignore-scripts'
        Write-Host "[info] Using --ignore-scripts for proposal-command. Pass -RespectLifecycleScripts to disable this behavior."
      }
      Invoke-CheckedCommand -WorkingDirectory $ModuleInfo.Path -FileName 'npm.cmd' -Arguments $npmArgs
      return
    }
    'run' {
      if ([string]::IsNullOrWhiteSpace($ScriptName)) {
        throw "Action 'run' requires -Script <script-name>."
      }
      if (-not $ModuleInfo.Scripts.ContainsKey($ScriptName)) {
        throw "Script '$ScriptName' not found in $($ModuleInfo.Name) package.json."
      }
      $npmArgs = @('run', $ScriptName)
      if ($Args -and $Args.Count -gt 0) {
        $npmArgs += '--'
        $npmArgs += $Args
      }
      Invoke-CheckedCommand -WorkingDirectory $ModuleInfo.Path -FileName 'npm.cmd' -Arguments $npmArgs
      return
    }
    default {
      $scriptToRun = $RequestedAction
      if (-not $ModuleInfo.Scripts.ContainsKey($scriptToRun)) {
        $available = if ($ModuleInfo.Scripts.Count -gt 0) { ($ModuleInfo.Scripts.Keys | Sort-Object) -join ', ' } else { '(none)' }
        throw "Action '$RequestedAction' is not defined in $($ModuleInfo.Name) package.json scripts. Available: $available"
      }
      $npmArgs = @('run', $scriptToRun)
      if ($Args -and $Args.Count -gt 0) {
        $npmArgs += '--'
        $npmArgs += $Args
      }
      Invoke-CheckedCommand -WorkingDirectory $ModuleInfo.Path -FileName 'npm.cmd' -Arguments $npmArgs
      return
    }
  }
}

function Resolve-PythonEntryPoint {
  param(
    [Parameter(Mandatory = $true)]$ModuleInfo,
    [string]$ScriptName
  )

  if (-not [string]::IsNullOrWhiteSpace($ScriptName)) {
    $explicitPath = Join-Path $ModuleInfo.Path $ScriptName
    if (Test-Path -LiteralPath $explicitPath -PathType Leaf) {
      return $explicitPath
    }
    throw "Python script '$ScriptName' was not found under $($ModuleInfo.Path)."
  }

  $candidates = @(
    'run_pipeline.py',
    'run_ingest.py',
    'paperstack.py',
    'src\extract_invoice.py'
  )

  foreach ($candidate in $candidates) {
    $candidatePath = Join-Path $ModuleInfo.Path $candidate
    if (Test-Path -LiteralPath $candidatePath -PathType Leaf) {
      return $candidatePath
    }
  }

  throw "No default Python entrypoint found for module '$($ModuleInfo.Name)'. Pass -Script <relative-path-to-python-file>."
}

function Invoke-PythonAction {
  param(
    [Parameter(Mandatory = $true)]$ModuleInfo,
    [Parameter(Mandatory = $true)][string]$RequestedAction,
    [string]$ScriptName,
    [string[]]$Args
  )

  switch ($RequestedAction) {
    'install' {
      if (Test-Path -LiteralPath $ModuleInfo.RequirementsPath) {
        Invoke-CheckedCommand -WorkingDirectory $ModuleInfo.Path -FileName 'python' -Arguments @('-m', 'pip', 'install', '-r', 'requirements.txt')
      }
      elseif (Test-Path -LiteralPath $ModuleInfo.SetupPyPath) {
        Invoke-CheckedCommand -WorkingDirectory $ModuleInfo.Path -FileName 'python' -Arguments @('-m', 'pip', 'install', '-e', '.')
      }
      else {
        throw "No requirements.txt or setup.py found for module '$($ModuleInfo.Name)'."
      }
      return
    }
    'test' {
      $hasTopLevelTests = Test-Path -LiteralPath $ModuleInfo.TestsPath -PathType Container
      $nestedInvoiceTests = Join-Path $ModuleInfo.Path 'invoice-module\tests'

      if ($hasTopLevelTests) {
        $pytestArgs = @('-m', 'pytest', 'tests')
        if ($Args -and $Args.Count -gt 0) {
          $pytestArgs += $Args
        }
        Invoke-CheckedCommand -WorkingDirectory $ModuleInfo.Path -FileName 'python' -Arguments $pytestArgs
      }
      else {
        throw "No tests directory found for module '$($ModuleInfo.Name)'."
      }

      if (($ModuleInfo.Name -eq 'MOD-PAPERSTACK-PP') -and (Test-Path -LiteralPath $nestedInvoiceTests -PathType Container)) {
        # This module has duplicate conftest names; run test directories independently.
        $nestedPytestArgs = @('-m', 'pytest', 'invoice-module/tests')
        if ($Args -and $Args.Count -gt 0) {
          $nestedPytestArgs += $Args
        }
        Invoke-CheckedCommand -WorkingDirectory $ModuleInfo.Path -FileName 'python' -Arguments $nestedPytestArgs
      }
      return
    }
    default {
      $entrypoint = Resolve-PythonEntryPoint -ModuleInfo $ModuleInfo -ScriptName $ScriptName
      $entryRelative = $entrypoint.Substring($ModuleInfo.Path.Length).TrimStart('\')
      $pythonArgs = @($entryRelative)
      if ($Args -and $Args.Count -gt 0) {
        $pythonArgs += $Args
      }
      Invoke-CheckedCommand -WorkingDirectory $ModuleInfo.Path -FileName 'python' -Arguments $pythonArgs
      return
    }
  }
}

$repoRoot = Split-Path $PSScriptRoot -Parent
$toolingRoot = Join-Path $repoRoot 'tooling'

if (-not (Test-Path -LiteralPath $toolingRoot -PathType Container)) {
  throw "Tooling directory not found: $toolingRoot"
}

if ($Action -eq 'list') {
  Show-ModuleList -ToolingRoot $toolingRoot
  exit 0
}

if ([string]::IsNullOrWhiteSpace($Module)) {
  throw "Module is required for action '$Action'. Example: .\\scripts\\start-module.ps1 -Module command-center -Action test"
}

$moduleInfo = Get-ModuleInfo -ToolingRoot $toolingRoot -ModuleName $Module

if ($moduleInfo.IsNode) {
  Invoke-NodeAction -ModuleInfo $moduleInfo -RequestedAction $Action -ScriptName $Script -Args $ExtraArgs -HonorLifecycle:$RespectLifecycleScripts
  exit 0
}

if ($moduleInfo.IsPython) {
  Invoke-PythonAction -ModuleInfo $moduleInfo -RequestedAction $Action -ScriptName $Script -Args $ExtraArgs
  exit 0
}

throw "Module '$Module' is neither a Node package nor a Python module (no package.json, requirements.txt, or setup.py)."
