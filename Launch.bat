@echo off
title TrendTrack Launcher
echo Starting TrendTrack Application...
echo Please wait while the application server starts.
echo It will open in your default browser automatically.

:: Change directory to the location of this batch file
cd /d "%~dp0"

:: Check if node_modules exists, if not run npm install
IF NOT EXIST "node_modules\" (
    echo.
    echo First time setup: Installing dependencies...
    call npm install
)

:: Run the development server and open the browser
echo.
echo Launching...
call npm run dev -- --open
