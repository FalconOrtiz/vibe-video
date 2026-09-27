$ErrorActionPreference = "Stop"
& node (Join-Path $PSScriptRoot "self-test.mjs")
exit $LASTEXITCODE
