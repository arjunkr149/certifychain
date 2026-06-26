@echo off
title CertifyChain Server
color 0A
echo.
echo  ==========================================
echo   CertifyChain - AI Certificate Verifier
echo  ==========================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  ERROR: Node.js not installed!
    echo  Download from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Kill anything on port 3000 already
echo  Checking port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " 2^>nul') do (
    taskkill /f /pid %%a >nul 2>nul
)

echo  Starting server on http://localhost:3000
echo  Open this URL in your browser
echo  Press Ctrl+C to stop
echo.
node server.js
pause
