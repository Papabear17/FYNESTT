@echo off
echo ========================================
echo FYNEST Admin Panel Launcher
echo ========================================
echo.
echo Starting server on port 3001...
echo.

REM Check if server is already running
netstat -ano | findstr ":3001" > nul
if %errorlevel% equ 0 (
    echo Server is already running!
    echo Opening Admin Panel...
    start http://localhost:3001/admin_index.html
) else (
    echo Starting new server...
    start "FYNEST Server" cmd /k "node server.js"
    timeout /t 2 /nobreak > nul
    echo Opening Admin Panel...
    start http://localhost:3001/admin_index.html
)

echo.
echo ========================================
echo Admin Panel is ready!
echo Close the server window to stop.
echo ========================================
echo.
pause
