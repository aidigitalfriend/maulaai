#!/usr/bin/env node
/**
 * API Routes Audit Script
 * Compares frontend API routes with backend routes to identify gaps
 */

const fs = require('fs');
const path = require('path');

// Frontend API routes discovered
const FRONTEND_API_ROUTES = {
  'auth': [
    '/api/auth/error',
    '/api/auth/login', 
    '/api/auth/signup',
    '/api/auth/verify'
  ],
  'doctor-network': [
    '/api/doctor-network',
    '/api/doctor-network/feedback'
  ],
  'lab': [
    '/api/lab/battle-arena',
    '/api/lab/dream-analysis',
    '/api/lab/emotion-analysis',
    '/api/lab/future-prediction',
    '/api/lab/image-generation',
    '/api/lab/music-generation',
    '/api/lab/neural-art',
    '/api/lab/personality-analysis',
    '/api/lab/story-generation',
    '/api/lab/voice-generation'
  ],
  'status': [
    '/api/status',
    '/api/status/analytics',
    '/api/status/api-status',
    '/api/status/stream'
  ],
  'stripe': [
    '/api/stripe/checkout',
    '/api/stripe/webhook'
  ],
  'studio': [
    '/api/studio/chat'
  ],
  'subscriptions': [
    '/api/subscriptions'
  ],
  'tools': [
    '/api/tools/api-tester',
    '/api/tools/dns-lookup-advanced',
    '/api/tools/dns-lookup',
    '/api/tools/domain-availability',
    '/api/tools/domain-reputation',
    '/api/tools/domain-research',
    '/api/tools/hash',
    '/api/tools/ip-geolocation',
    '/api/tools/ip-netblocks',
    '/api/tools/mac-lookup',
    '/api/tools/ping-test',
    '/api/tools/port-scanner',
    '/api/tools/speed-test',
    '/api/tools/ssl-checker',
    '/api/tools/threat-intelligence',
    '/api/tools/traceroute',
    '/api/tools/website-categorization',
    '/api/tools/whois-lookup'
  ],
  'user': [
    '/api/user/analytics'
  ],
  'x-community': [
    '/api/x-community/metrics',
    '/api/x-community/posts',
    '/api/x-community/presence/ping',
    '/api/x-community/stream',
    '/api/x-community/top-members'
  ]
};

// Backend routes discovered (from backend/routes folder)
const BACKEND_ROUTES = [
  '/api/agent-optimized',
  '/api/agent-subscriptions', 
  '/api/agentChatHistory',
  '/api/agentCollections',
  '/api/agentSubscriptions',
  '/api/agentUsage',
  '/api/agents',
  '/api/ai-lab-extended',
  '/api/ai-lab-main',
  '/api/ai-lab',
  '/api/analytics',
  '/api/rewardsCenter',
  '/api/simple-agent',
  '/api/user-dashboard',
  '/api/userPreferences',
  '/api/userProfile',
  '/api/userSecurity'
];

function analyzeAPIRoutes() {
  console.log('🔍 API ROUTES ANALYSIS STARTING...\n');

  const gaps = {
    missingFromFrontend: [],
    missingFromBackend: [],
    onlyInFrontend: [],
    onlyInBackend: [],
    recommendations: []
  };

  // Flatten frontend routes for comparison
  const frontendRoutes = [];
  Object.values(FRONTEND_API_ROUTES).forEach(routes => {
    frontendRoutes.push(...routes);
  });

  console.log('📊 ROUTE COUNTS:');
  console.log(`Frontend API routes: ${frontendRoutes.length}`);
  console.log(`Backend API routes: ${BACKEND_ROUTES.length}\n`);

  // Check for gaps between frontend and backend
  console.log('🔄 CHECKING FOR ALIGNMENT GAPS...\n');

  // Agent-related routes analysis
  console.log('🤖 AGENT ROUTES ANALYSIS:');
  const agentBackendRoutes = BACKEND_ROUTES.filter(route => 
    route.includes('agent') || route.includes('Agent')
  );
  
  console.log('Backend agent routes:');
  agentBackendRoutes.forEach(route => console.log(`  ✅ ${route}`));

  const agentFrontendRoutes = frontendRoutes.filter(route => 
    route.includes('agent') || route.includes('Agent')
  );
  
  if (agentFrontendRoutes.length === 0) {
    console.log('❌ NO AGENT ROUTES IN FRONTEND API!');
    gaps.missingFromFrontend.push('Agent subscription routes');
    gaps.missingFromFrontend.push('Agent chat history routes');
    gaps.missingFromFrontend.push('Agent collections routes');
    gaps.recommendations.push('Create frontend API proxy routes for agent operations');
  }

  // AI Lab routes analysis
  console.log('\n🔬 AI LAB ROUTES ANALYSIS:');
  const labBackendRoutes = BACKEND_ROUTES.filter(route => 
    route.includes('lab') || route.includes('Lab')
  );
  
  const labFrontendRoutes = FRONTEND_API_ROUTES.lab || [];
  
  console.log(`Backend lab routes: ${labBackendRoutes.length}`);
  console.log(`Frontend lab routes: ${labFrontendRoutes.length}`);

  if (labBackendRoutes.length > 0 && labFrontendRoutes.length > 0) {
    console.log('✅ Lab routes exist in both frontend and backend');
  }

  // Auth routes analysis
  console.log('\n🔐 AUTH ROUTES ANALYSIS:');
  const authFrontendRoutes = FRONTEND_API_ROUTES.auth || [];
  console.log(`Frontend auth routes: ${authFrontendRoutes.length}`);
  authFrontendRoutes.forEach(route => console.log(`  ✅ ${route}`));

  // Check for missing agent proxy routes
  console.log('\n⚠️  CRITICAL GAPS IDENTIFIED:');
  
  if (!frontendRoutes.some(route => route.includes('agents'))) {
    gaps.missingFromFrontend.push('/api/agents (main agents list)');
  }
  
  if (!frontendRoutes.some(route => route.includes('agent-collections'))) {
    gaps.missingFromFrontend.push('/api/agent-collections (individual collections)');
  }
  
  if (!frontendRoutes.some(route => route.includes('agent-subscriptions'))) {
    gaps.missingFromFrontend.push('/api/agent-subscriptions (subscription management)');
  }

  // Generate recommendations
  console.log('\n💡 RECOMMENDATIONS:');

  if (gaps.missingFromFrontend.length > 0) {
    console.log('🔧 MISSING FRONTEND API ROUTES:');
    gaps.missingFromFrontend.forEach(route => {
      console.log(`   ❌ ${route}`);
    });
    
    console.log('\n📝 REQUIRED ACTIONS:');
    console.log('   1. Create /api/agents/route.ts - Proxy to backend agents API');
    console.log('   2. Create /api/agent-collections/route.ts - Proxy to backend collections API');
    console.log('   3. Create /api/agent-subscriptions/route.ts - Proxy to subscription API');
    console.log('   4. Create /api/secure-chat/route.ts - Secure chat API for agents');
  } else {
    console.log('✅ All critical routes appear to be covered');
  }

  // Frontend-specific features analysis
  console.log('\n🎯 FRONTEND-SPECIFIC FEATURES:');
  const frontendSpecific = [
    'tools', 'doctor-network', 'studio', 'x-community'
  ];
  
  frontendSpecific.forEach(feature => {
    if (FRONTEND_API_ROUTES[feature]) {
      console.log(`✅ ${feature}: ${FRONTEND_API_ROUTES[feature].length} routes`);
    }
  });

  return gaps;
}

// Run the analysis
const results = analyzeAPIRoutes();

console.log('\n' + '='.repeat(60));
console.log('📈 FINAL API ROUTES SUMMARY');
console.log('='.repeat(60));

if (results.missingFromFrontend.length === 0) {
  console.log('🎉 API ROUTES PERFECTLY ALIGNED!');
  console.log('✅ All required frontend proxy routes exist');
  console.log('✅ Backend agent APIs properly exposed');
  console.log('✅ Authentication routes implemented');
  console.log('✅ Lab and tools APIs available');
} else {
  console.log('🔧 ACTION REQUIRED:');
  console.log(`   Missing frontend routes: ${results.missingFromFrontend.length}`);
  console.log('   Priority: Create agent API proxy routes');
}

console.log('\n✨ Analysis completed!');