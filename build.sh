#!/bin/bash
# Custom build script for Netlify deployment

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

# Check if vite is installed
if ! npx vite --version > /dev/null 2>&1; then
  echo "Vite not found, installing dependencies..."
  npm install
  
  # Check again
  if ! npx vite --version > /dev/null 2>&1; then
    echo "Vite still not found, installing it globally..."
    npm install -g vite
  fi
fi

echo "Vite version: $(npx vite --version)"
echo "Building project..."

# Run the build
npm run build

# Check build success
if [ $? -ne 0 ]; then
  echo "Build failed!"
  exit 1
else
  echo "Build successful!"
  echo "Generated files in dist directory:"
  ls -la dist
fi
