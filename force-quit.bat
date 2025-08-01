@echo off
echo =======================================
echo  Interview Coder - Force Quit Tool
echo =======================================

echo [1/3] Force killing all Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo   ✓ Node.js processes terminated
) else (
    echo   ✓ No Node.js processes found
)

echo [2/3] Force killing all Electron processes...
taskkill /F /IM electron.exe 2>nul
if %errorlevel% equ 0 (
    echo   ✓ Electron processes terminated
) else (
    echo   ✓ No Electron processes found
)

echo [3/3] Waiting for cleanup...
timeout /t 2 /nobreak >nul

echo.
echo ✅ All application processes have been terminated!
echo You can now safely restart the application.
echo.
pause
