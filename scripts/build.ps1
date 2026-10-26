$ErrorActionPreference = 'Stop'
node "$PSScriptRoot/build.mjs"
exit $LASTEXITCODE
