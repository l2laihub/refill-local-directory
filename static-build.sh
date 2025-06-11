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

# Create a favicon SVG
echo "Creating favicon.svg..."
cat > dist/favicon.svg << 'EOL'
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="6" fill="#5c916e"/><path d="M16 8L24 16L16 24L8 16L16 8Z" fill="white"/></svg>
EOL

# Create a more polished static index.html
echo "Creating enhanced landing page..."
cat > dist/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RefillLocal - Find Refill & Zero-Waste Stores Near You</title>
    <meta name="description" content="Discover local refill and zero-waste stores where you can shop plastic-free, reduce waste, and live more sustainably." />
    <meta property="og:title" content="RefillLocal - Find Refill & Zero-Waste Stores Near You" />
    <meta property="og:description" content="Discover local refill and zero-waste stores where you can shop plastic-free, reduce waste, and live more sustainably." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://refilllocal.com" />
    <style>
      :root {
        --color-primary: #5c916e;
        --color-primary-light: #78b08a;
        --color-primary-dark: #477355;
        --color-accent: #f8b400;
        --color-text: #333;
        --color-text-light: #666;
        --color-background: #f9f9f9;
        --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        --radius: 8px;
        --transition: all 0.3s ease;
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        line-height: 1.6;
        color: var(--color-text);
        background-color: var(--color-background);
      }
      
      .wrapper {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
      }
      
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 0;
        border-bottom: 1px solid rgba(0,0,0,0.1);
      }
      
      .logo {
        font-size: 1.8rem;
        font-weight: bold;
        color: var(--color-primary);
        text-decoration: none;
      }
      
      .hero {
        text-align: center;
        padding: 80px 20px;
      }
      
      h1 {
        font-size: 2.5rem;
        color: var(--color-primary);
        margin-bottom: 20px;
      }
      
      .subtitle {
        font-size: 1.2rem;
        color: var(--color-text-light);
        max-width: 700px;
        margin: 0 auto 40px;
      }
      
      .cta {
        display: inline-block;
        background: var(--color-primary);
        color: white;
        padding: 12px 28px;
        border-radius: var(--radius);
        text-decoration: none;
        font-weight: 600;
        transition: var(--transition);
        box-shadow: var(--shadow);
      }
      
      .cta:hover {
        background: var(--color-primary-dark);
        transform: translateY(-2px);
        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
      }
      
      .features {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 30px;
        padding: 60px 0;
      }
      
      .feature {
        background: white;
        padding: 30px;
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        text-align: center;
        transition: var(--transition);
      }
      
      .feature:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }
      
      .feature-icon {
        font-size: 2.5rem;
        color: var(--color-primary);
        margin-bottom: 20px;
      }
      
      .feature h3 {
        margin-bottom: 15px;
        color: var(--color-primary);
      }
      
      .waitlist {
        background: linear-gradient(to right, var(--color-primary-dark), var(--color-primary));
        color: white;
        padding: 60px 20px;
        text-align: center;
        margin: 40px 0;
        border-radius: var(--radius);
      }
      
      .waitlist h2 {
        margin-bottom: 20px;
      }
      
      .waitlist p {
        margin-bottom: 30px;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
      }
      
      .waitlist-form {
        display: flex;
        max-width: 500px;
        margin: 0 auto;
      }
      
      .waitlist-input {
        flex: 1;
        padding: 12px 15px;
        border: none;
        border-radius: var(--radius) 0 0 var(--radius);
        font-size: 1rem;
      }
      
      .waitlist-button {
        background: var(--color-accent);
        color: var(--color-text);
        font-weight: bold;
        border: none;
        padding: 0 20px;
        border-radius: 0 var(--radius) var(--radius) 0;
        cursor: pointer;
        transition: var(--transition);
      }
      
      .waitlist-button:hover {
        background: #e0a400;
      }
      
      footer {
        text-align: center;
        padding: 40px 0;
        color: var(--color-text-light);
        border-top: 1px solid rgba(0,0,0,0.1);
      }
      
      @media (max-width: 768px) {
        h1 {
          font-size: 2rem;
        }
        
        .features {
          grid-template-columns: 1fr;
        }
        
        .waitlist-form {
          flex-direction: column;
        }
        
        .waitlist-input {
          border-radius: var(--radius) var(--radius) 0 0;
          margin-bottom: 1px;
        }
        
        .waitlist-button {
          border-radius: 0 0 var(--radius) var(--radius);
          padding: 12px;
        }
      }
    </style>
  </head>
  <body>
    <header>
      <div class="wrapper">
        <a href="/" class="logo">RefillLocal</a>
      </div>
    </header>
    
    <main>
      <section class="hero">
        <div class="wrapper">
          <h1>Find Refill & Zero-Waste Stores Near You</h1>
          <p class="subtitle">Discover local refill and zero-waste stores where you can shop plastic-free, reduce waste, and live more sustainably.</p>
          <a href="#waitlist" class="cta">Join the Waitlist</a>
        </div>
      </section>
      
      <section class="wrapper">
        <div class="features">
          <div class="feature">
            <div class="feature-icon">🔍</div>
            <h3>Find Nearby Stores</h3>
            <p>Easily search for refill and zero-waste stores in your city or nearby areas.</p>
          </div>
          <div class="feature">
            <div class="feature-icon">♻️</div>
            <h3>Live Sustainably</h3>
            <p>Reduce your plastic waste by shopping at stores that offer package-free options.</p>
          </div>
          <div class="feature">
            <div class="feature-icon">🌿</div>
            <h3>Support Local</h3>
            <p>Help local businesses thrive while making environmentally conscious choices.</p>
          </div>
        </div>
      </section>
      
      <section id="waitlist" class="wrapper">
        <div class="waitlist">
          <h2>Be the First to Know</h2>
          <p>We're currently building our database of refill stores. Join our waitlist to be notified when we launch in your city!</p>
          <form class="waitlist-form" onsubmit="alert('Thank you for joining our waitlist! We\'ll notify you when we launch.'); return false;">
            <input type="email" class="waitlist-input" placeholder="Your email address" required>
            <button type="submit" class="waitlist-button">Join Waitlist</button>
          </form>
        </div>
      </section>
    </main>
    
    <footer>
      <div class="wrapper">
        <p>&copy; 2025 RefillLocal. All rights reserved.</p>
      </div>
    </footer>
  </body>
</html>
EOL
echo "Created index.html"

# Check files in dist
echo "Files in dist directory:"
ls -la dist

echo "Build process complete!"
