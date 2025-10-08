const axios = require('axios');

// Test the API endpoints
async function testAPI() {
  const baseURL = 'http://localhost:3000';

  try {
    // Test health endpoint
    console.log('🧪 Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check:', healthResponse.data);

    // Test user registration
    console.log('🧪 Testing user registration...');
    const registerResponse = await axios.post(`${baseURL}/api/auth/register`, {
      email: 'test@neustream.com',
      password: 'test123'
    });
    console.log('✅ User registered:', registerResponse.data.user.email);

    // Test stream info
    console.log('🧪 Testing stream info...');
    const streamResponse = await axios.get(`${baseURL}/api/streams/info?userId=1`);
    console.log('✅ Stream info:', streamResponse.data);

    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAPI();