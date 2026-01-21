@echo off
SETLOCAL EnableDelayedExpansion

echo ==========================================
echo   Omni Meet Extension Installer
echo ==========================================

:: Check if Python is installed
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.8+ and try again.
    pause
    exit /b 1
)

:: Define paths
SET "SCRIPT_DIR=%~dp0"
SET "MEET_DIR=%SCRIPT_DIR%satellites\meet"
SET "VENV_DIR=%MEET_DIR%\.venv"

echo Target Directory: %MEET_DIR%

:: Navigate to meet directory
cd /d "%MEET_DIR%"

:: Create virtual environment if it doesn't exist
IF NOT EXIST "%VENV_DIR%" (
    echo [INFO] Creating virtual environment...
    python -m venv .venv
) ELSE (
    echo [INFO] Virtual environment already exists.
)

:: Activate venv
call "%VENV_DIR%\Scripts\activate.bat"

:: Upgrade pip
echo [INFO] Upgrading pip...
python -m pip install --upgrade pip

:: Install the package in editable mode
echo [INFO] Installing omni-meet package...
pip install -e .

echo.
echo ==========================================
echo   Installation Complete!
echo ==========================================
echo.
echo To run the extension, use the activated environment:
echo 1. cd satellites\meet
echo 2. .venv\Scripts\activate
echo 3. omni-meet
echo.
echo OR run directly with the full path:
echo "%VENV_DIR%\Scripts\omni-meet"
echo.
pause
