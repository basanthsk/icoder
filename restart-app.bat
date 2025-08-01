@echo off
echo =====================================
echo  Interview Coder - App Restart Tool
echo =====================================

echo [1/5] Force killing all Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo   ✓ Node.js processes terminated
) else (
    echo   ✓ No Node.js processes running
)

echo [2/5] Force killing all Electron processes...
taskkill /F /IM electron.exe 2>nul
if %errorlevel% equ 0 (
    echo   ✓ Electron processes terminated
) else (
    echo   ✓ No Electron processes running
)

echo [3/5] Waiting for processes to close...
timeout /t 3 /nobreak >nul

echo [4/5] Cleaning build directories...
cd /d "%~dp0"
npm run clean

echo [5/5] Starting the application...
echo.
echo 🚀 Starting Interview Coder...
echo Press Ctrl+Q in the app to quit properly.
echo If the app doesn't close, use force-quit.bat
echo.
npm run dev
