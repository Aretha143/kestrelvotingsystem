#!/bin/bash

echo "🏆 Starting Kestrel Nest Garden Voting System..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

echo ""
echo "🚀 Starting the application..."
echo "📱 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:5000"
echo ""
echo "🔐 Default Admin Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "👥 Sample Staff Credentials:"
echo "   Staff ID: EMP001, PIN: 1234"
echo "   Staff ID: EMP002, PIN: 5678"
echo "   Staff ID: EMP003, PIN: 9012"
echo "   Staff ID: EMP004, PIN: 3456"
echo "   Staff ID: EMP005, PIN: 7890"
echo ""

# Start the development servers
npm run dev
