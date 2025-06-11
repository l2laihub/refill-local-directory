// Custom Netlify build plugin to ensure dependencies are properly installed
// This plugin runs before the build and verifies that vite is installed

module.exports = {
  // Plugin name
  name: 'netlify-plugin-ensure-dependencies',
  
  // Hook into the build process before it starts
  onPreBuild: async ({ utils }) => {
    const { run } = utils;
    
    try {
      // Log the current environment
      console.log('Node version:', process.version);
      console.log('NPM version:', await run.command('npm --version'));
      console.log('Current directory:', process.cwd());
      console.log('Directory contents:', await run.command('ls -la'));
      
      // Check if package.json exists
      console.log('Checking for package.json...');
      await run.command('ls -la package.json');
      console.log('package.json found');
      
      // Check if node_modules exists
      console.log('Checking for node_modules...');
      try {
        await run.command('ls -la node_modules');
        console.log('node_modules found');
      } catch (error) {
        console.log('node_modules not found, installing dependencies...');
        await run.command('npm install');
      }
      
      // Verify that vite is installed
      console.log('Checking for vite...');
      try {
        await run.command('npx vite --version');
        console.log('Vite is installed');
      } catch (error) {
        console.log('Vite not found, installing dependencies...');
        await run.command('npm install');
        
        // Verify again
        try {
          await run.command('npx vite --version');
          console.log('Vite is now installed');
        } catch (secondError) {
          // If vite is still not found, force install it globally
          console.log('Vite still not found, installing it globally...');
          await run.command('npm install -g vite');
          await run.command('vite --version');
        }
      }
      
      console.log('All dependencies verified');
    } catch (error) {
      // If any errors occur, log them
      console.error('Error checking dependencies:', error);
      
      // Return a non-zero exit code to fail the build
      utils.build.failBuild('Failed to verify dependencies', { error });
    }
  }
};
