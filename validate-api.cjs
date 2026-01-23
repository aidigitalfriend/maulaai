const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const BASE_URL = 'http://localhost:3005';

const endpoints = [
  // Health & Status
  { path: '/api/status', method: 'GET', description: 'API Status' },
  { path: '/api/health', method: 'GET', description: 'Health Check' },

  // Authentication
  { path: '/api/auth/login', method: 'POST', description: 'Login' },
  { path: '/api/auth/signup', method: 'POST', description: 'Signup' },
  { path: '/api/auth/verify', method: 'POST', description: 'Verify Auth' },

  // User Management
  { path: '/api/user/profile', method: 'GET', description: 'User Profile' },
  { path: '/api/user/analytics', method: 'GET', description: 'User Analytics' },

  // Agents
  { path: '/api/agents', method: 'GET', description: 'List Agents' },
  { path: '/api/agent/chat', method: 'POST', description: 'Agent Chat' },

  // Chat
  { path: '/api/chat/sessions', method: 'GET', description: 'Chat Sessions' },
  { path: '/api/chat/interactions', method: 'GET', description: 'Chat Interactions' },

  // Payments
  { path: '/api/stripe/checkout', method: 'POST', description: 'Stripe Checkout' },
  { path: '/api/subscriptions', method: 'GET', description: 'Subscriptions' },

  // Tools
  { path: '/api/tools/dns-lookup', method: 'POST', description: 'DNS Lookup' },
  { path: '/api/tools/ip-geolocation', method: 'POST', description: 'IP Geolocation' },

  // Community
  { path: '/api/community/posts', method: 'GET', description: 'Community Posts' },

  // Analytics
  { path: '/api/status/analytics', method: 'GET', description: 'Analytics Status' },
];

async function testEndpoint(endpoint) {
  const url = BASE_URL + endpoint.path;
  let curlCommand = `curl -s -o /dev/null -w "%{http_code}\\n%{time_total}" -X ${endpoint.method}`;

  // Add headers
  curlCommand += ` -H "Content-Type: application/json"`;
  curlCommand += ` -H "User-Agent: API-Validation/1.0"`;

  // Add body for POST requests
  if (endpoint.method === 'POST') {
    let body = '{}';
    if (endpoint.path.includes('/api/auth/')) {
      body = '{"email":"test@example.com","password":"test123"}';
    } else if (endpoint.path.includes('/api/agent/chat')) {
      body = '{"agentId":"test","message":"Hello"}';
    } else if (endpoint.path.includes('/api/stripe/checkout')) {
      body = '{"agentId":"test","plan":"daily"}';
    } else if (endpoint.path.includes('/api/tools/')) {
      body = '{"target":"example.com"}';
    }
    curlCommand += ` -d '${body}'`;
  }

  curlCommand += ` "${url}"`;

  try {
    const { stdout, stderr } = await execAsync(curlCommand);
    const lines = stdout.trim().split('\n').filter(line => line.trim());
    const httpCode = parseInt(lines[lines.length - 2]);
    const timeTotal = parseFloat(lines[lines.length - 1]);
    const duration = Math.round(timeTotal * 1000);

    const status = httpCode;

    let result = '✅';
    if (status >= 400) result = '❌';
    else if (status >= 300) result = '⚠️';

    console.log(`${result} ${endpoint.method} ${endpoint.path} - ${status} (${duration}ms)`);

    return { endpoint: endpoint.path, status, duration, success: status < 400 };

  } catch (error) {
    console.log(`❌ ${endpoint.method} ${endpoint.path} - ERROR: ${error.message}`);
    return { endpoint: endpoint.path, status: 'ERROR', duration: 0, success: false };
  }
}

async function validateAPIs() {
  console.log('🔍 Starting API Endpoint Validation...\n');
  console.log(`Testing ${endpoints.length} endpoints against ${BASE_URL}\n`);

  const results = [];

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);

    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n📊 Validation Summary:');
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;

  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((successful / results.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ Failed Endpoints:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.endpoint}: ${r.status}`);
    });
  }

  console.log('\n✅ API validation completed!');
}

validateAPIs().catch(console.error);