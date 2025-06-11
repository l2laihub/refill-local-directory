// Simple build script for Netlify
const { execSync } = require('child_process');

console.log('Starting build process...');

// Print environment info
console.log('Node version:', process.version);
try {
  console.log('NPM version:', execSync('npm --version').toString().trim());
} catch (error) {
  console.log('Error getting npm version:', error.message);
}

// Install dependencies
console.log('\nInstalling dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('Successfully installed dependencies');
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  process.exit(1);
}

// Create a minimal vite.config.js file (JavaScript instead of TypeScript)
console.log('\nCreating minimal vite.config.js...');
const fs = require('fs');
fs.writeFileSync('vite.config.js', `
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
`);
console.log('Created vite.config.js');

// Run the build
console.log('\nRunning build...');
try {
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Error during build:', error.message);
  process.exit(1);
}

// List the files in the dist directory
console.log('\nFiles in dist directory:');
try {
  console.log(execSync('ls -la dist').toString());
} catch (error) {
  console.error('Error listing dist directory:', error.message);
}

console.log('\nBuild process complete!');
