$ScriptDir = Split-Path $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ScriptDir "backend"
$env:PYTHONPATH = $BackendDir

Write-Host "Changing directory to $BackendDir..."
Set-Location -Path $BackendDir

Write-Host "Starting Cortex Backend..."
python -m cortex.main
