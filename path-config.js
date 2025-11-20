/**
 * Path Configuration Helper
 * Auto-detects environment and sets correct paths
 */

const os = require('os');
const path = require('path');

/**
 * Detect if we're running in development (macOS/Windows) or production (EC2/Linux)
 */
function detectEnvironment() {
  const platform = os.platform();
  const hostname = os.hostname();
  
  // Check if running on EC2
  if (hostname.includes('ec2') || hostname.includes('ubuntu')) {
    return 'production';
  }
  
  // Check if running on macOS/Windows
  if (platform === 'darwin' || platform === 'win32') {
    return 'development';
  }
  
  // Default to production for Linux servers
  if (platform === 'linux') {
    return 'production';
  }
  
  return 'development';
}

/**
 * Get correct base path based on environment
 */
function getBasePath() {
  const env = detectEnvironment();
  
  if (env === 'production') {
    return '/home/ubuntu/shiny-friend-disco';
  }
  
  // For development, use current working directory
  return process.cwd();
}

/**
 * Get frontend path
 */
function getFrontendPath() {
  return path.join(getBasePath(), 'frontend');
}

/**
 * Get backend path
 */
function getBackendPath() {
  return path.join(getBasePath(), 'backend');
}

/**
 * Get environment file paths
 */
function getEnvPaths() {
  const base = getBasePath();
  return {
    root: path.join(base, '.env'),
    frontend: path.join(base, 'frontend', '.env'),
    backend: path.join(base, 'backend', '.env'),
  };
}

/**
 * Get API URLs based on environment
 */
function getApiUrls() {
  const env = detectEnvironment();
  
  if (env === 'production') {
    return {
      frontend: 'https://onelastai.co',
      backend: 'https://onelastai.co/api',
      internal: 'http://127.0.0.1:3005',
    };
  }
  
  return {
    frontend: 'http://localhost:3000',
    backend: 'http://localhost:3005',
    internal: 'http://localhost:3005',
  };
}

module.exports = {
  detectEnvironment,
  getBasePath,
  getFrontendPath,
  getBackendPath,
  getEnvPaths,
  getApiUrls,
};

// CLI usage
if (require.main === module) {
  console.log('🔍 Path Configuration');
  console.log('====================');
  console.log('Environment:', detectEnvironment());
  console.log('Base Path:', getBasePath());
  console.log('Frontend Path:', getFrontendPath());
  console.log('Backend Path:', getBackendPath());
  console.log('\n📁 Environment Files:');
  const envPaths = getEnvPaths();
  console.log('  Root:', envPaths.root);
  console.log('  Frontend:', envPaths.frontend);
  console.log('  Backend:', envPaths.backend);
  console.log('\n🌐 API URLs:');
  const urls = getApiUrls();
  console.log('  Frontend:', urls.frontend);
  console.log('  Backend:', urls.backend);
  console.log('  Internal:', urls.internal);
}
