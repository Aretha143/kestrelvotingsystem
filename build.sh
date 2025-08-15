#!/bin/bash

echo "🚀 Starting build process for Kestrel Voting System Frontend..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Navigate to client directory and install dependencies
echo "📦 Installing client dependencies..."
cd client
npm install

# Build the React app
echo "🔨 Building React app..."
npm run build

# Verify build directory exists
echo "🔍 Verifying build directory..."
if [ -d "build" ]; then
    echo "✅ Build directory created successfully!"
    ls -la build/
else
    echo "❌ Build directory not found!"
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Build files are in: client/build"
