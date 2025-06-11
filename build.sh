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

# Clean install without cache
echo "Installing dependencies with clean install..."
rm -rf node_modules package-lock.json
npm install

# Explicitly install vite and its dependencies
echo "Explicitly installing vite..."
npm install vite @vitejs/plugin-react --save-dev

# Print installed packages for debugging
echo "Installed packages in node_modules:"
ls -la node_modules | grep vite
ls -la node_modules/@vitejs

# Verify vite can be executed and show version
echo "Verifying vite can be executed..."
npx vite --version

echo "Vite version: $(npx vite --version)"
echo "Building project..."

# Ensure the vite config is valid
echo "Checking vite.config.ts..."
cat vite.config.ts

# Run the build with NODE_ENV set to production and directly using npx
echo "Building the project..."
NODE_ENV=production npx vite build

# Check build success
if [ $? -ne 0 ]; then
  echo "Build failed!"
  exit 1
else
  echo "Build successful!"
  echo "Generated files in dist directory:"
  ls -la dist
fi
