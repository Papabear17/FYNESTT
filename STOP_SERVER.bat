@echo off
echo ========================================
echo FYNEST Server Stopper
echo ========================================
echo.
echo Stopping server on port 3001...
echo.

REM Find and kill process using port 3001
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001"') do (
    echo Killing process %%a...
    taskkill /F /PID %%a > nul 2>&1
)

echo.
echo ========================================
echo Server stopped successfully!
echo ========================================
echo.
pause
