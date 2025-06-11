#!/bin/bash
# Simple build script for Netlify

set -e # Exit immediately if a command exits with a non-zero status

echo "Starting build process..."

# Print environment info
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"

# Install dependencies
echo -e "\nInstalling dependencies..."
npm install

# Create a minimal vite.config.js file
echo -e "\nCreating minimal vite.config.js..."
cat > vite.config.js << 'EOL'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
EOL
echo "Created vite.config.js"

# Run the build
echo -e "\nRunning build..."
NODE_ENV=production npx vite build

# List the files in the dist directory
echo -e "\nFiles in dist directory:"
ls -la dist

echo -e "\nBuild process complete!"
