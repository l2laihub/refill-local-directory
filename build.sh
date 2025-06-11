#!/usr/bin/env bash
# Custom build script for Netlify deployment
set -e # Exit immediately if a command exits with a non-zero status

# Print environment information
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "node_modules not found, installing dependencies..."
  npm install
else
  echo "node_modules exists, verifying dependencies..."
fi

# Force install dependencies
echo "Installing dependencies..."
npm ci || npm install

# Ensure vite is explicitly installed
echo "Making sure vite is installed..."
npm list vite || npm install vite --save-dev

# Verify vite can be executed
echo "Verifying vite can be executed..."
npx vite --version || npm install -g vite

echo "Vite version: $(npx vite --version)"
echo "Building project..."

# Run the build with direct path to vite
echo "Building the project..."
npx vite build

# Check build success
if [ $? -ne 0 ]; then
  echo "Build failed!"
  exit 1
else
  echo "Build successful!"
  echo "Generated files in dist directory:"
  ls -la dist
fi
