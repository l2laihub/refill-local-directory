#!/bin/bash
# Ultra-minimal static build script for Netlify

set -e # Exit immediately if a command exits with a non-zero status

echo "Starting minimal static build process..."

# Print environment info
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"

# Create dist directory
echo "Creating static dist directory..."
mkdir -p dist

# Copy public files to dist
echo "Copying public files to dist..."
cp -r public/* dist/ || true

# Create a minimal static index.html
echo "Creating minimal index.html..."
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
        <p>Our full site is currently being deployed and will be available soon.</p>
        <p>RefillLocal helps you find local refill and zero-waste stores where you can shop plastic-free, reduce waste, and live more sustainably.</p>
      </div>
      <a href="https://github.com/l2laihub/refill-local-directory" class="cta">View on GitHub</a>
    </div>
  </body>
</html>
EOL
echo "Created index.html"

# Check files in dist
echo "Files in dist directory:"
ls -la dist

echo "Build process complete!"
