import fetch from 'node-fetch';

async function testStatus() {
  try {
    const response = await fetch('http://localhost:3005/api/status');
    const data = await response.json();
    console.log('Status response structure:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testStatus();