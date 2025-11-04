#!/usr/bin/env node
/**
 * Integration Test for AI Agent Platform
 * Tests full frontend-backend connectivity
 */

const http = require('http');

// Test configuration
const FRONTEND_PORT = 3000;
const BACKEND_PORT = 3005;

console.log('🧪 Starting integration tests...\n');

// Test backend health endpoint
function testBackendHealth() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: BACKEND_PORT,
  path: '/health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Backend health check: PASSED');
          console.log(`   Status: ${res.statusCode}`);
          try {
            const healthData = JSON.parse(data);
            console.log(`   Service: ${healthData.service}`);
            console.log(`   Status: ${healthData.status}`);
          } catch (e) {
            console.log('   Response: OK (non-JSON)');
          }
          resolve(true);
        } else {
          console.log(`❌ Backend health check: FAILED (${res.statusCode})`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Backend health check: FAILED (${err.message})`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Backend health check: TIMEOUT');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Test frontend availability
function testFrontendAvailability() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: FRONTEND_PORT,
      path: '/agents/einstein',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Frontend Einstein agent: ACCESSIBLE');
        console.log(`   Status: ${res.statusCode}`);
        resolve(true);
      } else {
        console.log(`❌ Frontend Einstein agent: FAILED (${res.statusCode})`);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.log(`❌ Frontend Einstein agent: FAILED (${err.message})`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Frontend Einstein agent: TIMEOUT');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Main test runner
async function runIntegrationTests() {
  console.log('📋 Integration Test Results:');
  console.log('═'.repeat(50));
  
  const backendHealth = await testBackendHealth();
  const frontendAccess = await testFrontendAvailability();
  
  console.log('\n📊 Test Summary:');
  console.log('═'.repeat(50));
  
  const totalTests = 2;
  const passedTests = [backendHealth, frontendAccess].filter(Boolean).length;
  
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All integration tests PASSED!');
    console.log('🚀 System is fully operational!');
    console.log(`\n🌐 Access Points:`);
    console.log(`   Frontend: http://localhost:${FRONTEND_PORT}`);
    console.log(`   Backend:  http://localhost:${BACKEND_PORT}/api/health`);
    console.log(`   Einstein: http://localhost:${FRONTEND_PORT}/agents/einstein`);
  } else {
    console.log('\n⚠️  Some integration tests failed');
    console.log('🔧 Check service status and try again');
  }
}

// Run the tests
runIntegrationTests().catch(console.error);