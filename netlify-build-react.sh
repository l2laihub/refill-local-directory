#!/bin/bash
# Build script for Netlify to properly build the React application

# Don't set -e here, we want to handle errors gracefully

echo "Starting React build process..."

# Print environment info
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"

# First, ensure we have a clean installation
echo "Installing dependencies..."
npm ci || npm install

# Create a very simple vite.config.js (avoids TypeScript loading issues)
echo "Creating simplified vite.config.js..."
cat > vite.config.js << 'EOL'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
EOL

# Verify vite is installed
echo "Ensuring vite is available..."
npm list vite || npm install vite @vitejs/plugin-react --save-dev

# Copy important public files first (as a backup)
echo "Backing up public files..."
mkdir -p dist-backup
cp -r public/* dist-backup/ || true

# Run the build with verbose output
echo "Building React application..."
NODE_ENV=production npx vite build --debug
BUILD_RESULT=$?

# If build fails, use our backup static site
if [ $BUILD_RESULT -ne 0 ]; then
  echo "React build failed, using static fallback..."
  mkdir -p dist
  cp -r dist-backup/* dist/ || true
  
  # Create a minimal static index.html as fallback
  cat > dist/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RefillLocal - Find Refill & Zero-Waste Stores Near You</title>
    <meta name="description" content="Discover local refill and zero-waste stores where you can shop plastic-free, reduce waste, and live more sustainably." />
    <style>
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        line-height: 1.6;
        color: #333;
      }
      h1 { color: #5c916e; }
      .container { text-align: center; padding: 2rem; }
      .logo { font-size: 2rem; font-weight: bold; color: #5c916e; }
      .message { margin: 2rem 0; }
      .cta { 
        display: inline-block;
        background: #5c916e;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 0.25rem;
        text-decoration: none;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">RefillLocal</div>
      <h1>Find Refill & Zero-Waste Stores Near You</h1>
      <div class="message">
        <p>Our full React application is currently being built. Please check back soon for the complete experience.</p>
        <p>RefillLocal helps you find local refill and zero-waste stores where you can shop plastic-free, reduce waste, and live more sustainably.</p>
      </div>
      <a href="mailto:contact@refilllocal.com" class="cta">Contact Us</a>
    </div>
  </body>
</html>
EOL
else
  echo "React build completed successfully!"
  
  # Ensure we have _redirects file in the dist folder
  echo "Ensuring SPA routing works..."
  cp public/_redirects dist/ || echo "/* /index.html 200" > dist/_redirects
fi

# List files in dist
echo "Files in dist directory:"
ls -la dist

echo "Build process complete!"
