@echo off
echo ========================================
echo FYNEST Website Launcher
echo ========================================
echo.
echo Starting server on port 3001...
echo.

REM Start the Node.js server
start "FYNEST Server" cmd /k "node server.js"

REM Wait 2 seconds for server to start
timeout /t 2 /nobreak > nul

REM Open the website in default browser
echo Opening website...
start http://localhost:3001/index.html

echo.
echo ========================================
echo Server is running!
echo Close the server window to stop.
echo ========================================
echo.
pause
