@echo off
REM Akash Browser - Windows Setup Script

echo.
echo.
echo 🚀 Akash Browser Setup
echo ====================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed
    echo Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✅ Node.js version: %NODE_VERSION%
echo ✅ npm version: %NPM_VERSION%
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

REM Check for Chrome
set CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
if exist "%CHROME_PATH%" (
    echo ✅ Chrome detected
) else (
    set CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
    if exist "!CHROME_PATH!" (
        echo ✅ Chrome detected
    ) else (
        echo ⚠️  Chrome not found
        echo Please install Google Chrome or set CHROME_PATH environment variable
    )
)

echo.
echo ✅ Setup complete!
echo.
echo To start development:
echo   npm start
echo.
echo To build for production:
echo   npm run build
echo.
pause
