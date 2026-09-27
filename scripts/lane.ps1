param(
  [Parameter(Mandatory = $true)][ValidateSet("astra", "opus", "grok")][string]$Lane,
  [Parameter(Mandatory = $true)][ValidateSet("grok", "claude", "codex")][string]$Parent,
  [Parameter(Mandatory = $true)][string]$PromptFile,
  [Parameter(Mandatory = $true)][string]$OutFile,
  [Parameter(Mandatory = $true)][string]$Receipt,
  [Parameter(Mandatory = $true)][string]$Cwd,
  [ValidateSet("read-only", "workspace")][string]$Mode = "read-only",
  [switch]$DryRun,
  [switch]$Force
)
$ErrorActionPreference = "Stop"
$argv = @(
  (Join-Path $PSScriptRoot "lane.mjs"),
  "--lane", $Lane,
  "--parent", $Parent,
  "--mode", $Mode,
  "--cwd", $Cwd,
  "--prompt-file", $PromptFile,
  "--out-file", $OutFile,
  "--receipt", $Receipt
)
if ($DryRun) { $argv += "--dry-run" }
if ($Force) { $argv += "--force" }
& node @argv
exit $LASTEXITCODE
