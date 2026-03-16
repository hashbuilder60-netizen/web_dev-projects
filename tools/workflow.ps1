param(
  [ValidateSet("build","serve")] [string]$Task = "build",
  [int]$Port = 8000
)

$root = Split-Path -Parent $PSScriptRoot

function Run($cmd) {
  Write-Host "+ $cmd"
  & powershell -NoProfile -Command $cmd
  return $LASTEXITCODE
}

if ($Task -eq "build") {
  exit (Run "npm run build:ts")
}

if ($Task -eq "serve") {
  exit (Run "$env:PYTHON python -m http.server $Port")
}
