$ScriptDir = Split-Path $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ScriptDir "backend"
$env:PYTHONPATH = $BackendDir

Write-Host "Changing directory to $BackendDir..."
Set-Location -Path $BackendDir

Write-Host "Starting OmniAgentOS Backend..."
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
