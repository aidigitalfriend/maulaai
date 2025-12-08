#!/usr/bin/env node

console.log('🚀 Starting backend server...');
console.log('📁 Working directory:', process.cwd());
console.log('📝 Loading environment variables...');

import('./server-simple.js')
  .then(() => {
    console.log('✅ Server module loaded successfully');
  })
  .catch((err) => {
    console.error('❌ Failed to start server:');
    console.error(err);
    process.exit(1);
  });
