param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutFile
)
$ErrorActionPreference = "Stop"
& node (Join-Path $PSScriptRoot "probe-media.mjs") --input $InputPath --out $OutFile
exit $LASTEXITCODE
