$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Omni Meet Extension Installer (PS)     " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check Python
if (-not (Get-Command "python" -ErrorAction SilentlyContinue)) {
    Write-Error "Python is not installed or not in PATH."
    exit 1
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$MeetDir = Join-Path $ScriptDir "satellites\meet"
$VenvDir = Join-Path $MeetDir ".venv"

Write-Host "Target Directory: $MeetDir"

Set-Location -Path $MeetDir

# Create venv
if (-not (Test-Path $VenvDir)) {
    Write-Host "[INFO] Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
}
else {
    Write-Host "[INFO] Virtual environment already exists." -ForegroundColor Green
}

# Activate path logic (We can't easily "activate" the current shell persistently from a script, 
# so we use the venv python directly for installation)
$PipExe = Join-Path $VenvDir "Scripts\pip.exe"
$PythonExe = Join-Path $VenvDir "Scripts\python.exe"

# Upgrade pip
Write-Host "[INFO] Upgrading pip..." -ForegroundColor Yellow
& $PythonExe -m pip install --upgrade pip

# Install package
Write-Host "[INFO] Installing omni-meet package..." -ForegroundColor Yellow
& $PipExe install -e .

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "   Installation Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "To run the extension:"
Write-Host "1. cd satellites\meet"
Write-Host "2. .venv\Scripts\Activate.ps1"
Write-Host "3. omni-meet"
Write-Host ""
Write-Host "OR run directly:"
Write-Host "$VenvDir\Scripts\omni-meet.exe"
