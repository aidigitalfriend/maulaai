// Simple test of enhanced response generation
const { generateBasicEnhancedResponse } = require('./backend/routes/agent-optimized.js');

// Test the enhanced response function
const testAgentConfig = {
  agentId: 'ben-sega',
  primaryProvider: 'anthropic',
  model: 'claude-3-5-sonnet-20241022',
  specializedFor: ['Code generation', 'Software development', 'Technical architecture']
};

const testMessage = "Show me a React component with proper formatting";

try {
  // Import the function (this should work if the function is exported)
  const enhancedResponse = generateBasicEnhancedResponse(
    'ben-sega', 
    testMessage, 
    testAgentConfig, 
    []
  );
  
  console.log('✅ Enhanced Response Test:');
  console.log('Content:', enhancedResponse.content.substring(0, 200) + '...');
  console.log('Has Code Blocks:', enhancedResponse.formatting.hasCodeBlocks);
  console.log('Processing Time:', enhancedResponse.processingTime + 'ms');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.log('The function might not be exported properly.');
}