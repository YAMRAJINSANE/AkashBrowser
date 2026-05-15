#!/bin/bash

# Akash Browser - Setup Script

echo "🚀 Akash Browser Setup"
echo "===================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check for Chrome
if [[ "$OSTYPE" == "win32" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    CHROME_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    if [ -f "$CHROME_PATH" ]; then
        echo "✅ Chrome detected at: $CHROME_PATH"
    else
        echo "⚠️  Chrome not found at default location"
        echo "Please install Chrome or set CHROME_PATH environment variable"
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    if [ -f "$CHROME_PATH" ]; then
        echo "✅ Chrome detected at: $CHROME_PATH"
    else
        echo "⚠️  Chrome not found"
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if command -v google-chrome &> /dev/null; then
        echo "✅ Chrome detected"
    else
        echo "⚠️  Chrome not found"
        echo "Install with: sudo apt-get install google-chrome-stable"
    fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  npm start"
echo ""
echo "To build for production:"
echo "  npm run build"
echo ""
