@echo off
rem Word-Tac-Toe event relay — double-click to start.
rem Starts the relay, then opens the big-screen page in your default browser
rem (drag that window to the projector/monitor and press F for full screen).
title WiggleWoo Word-Tac-Toe relay
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found on this computer. Install it from https://nodejs.org and run this again.
  pause
  exit /b 1
)
if not exist node_modules (
  echo First run on this computer: installing the one dependency...
  call npm install --omit=dev
)

start "" cmd /c "timeout /t 2 >nul & start http://localhost:8787/"
node server.mjs

echo.
echo The relay stopped. Press any key to close this window.
pause >nul
