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

echo "✅ Build completed successfully!"
echo "📁 Build files are in: client/build"
